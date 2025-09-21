from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import shutil
import os
import sys
import logging
import json

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the inference modules
from crop_rec.crop_recommendation_inference import predict_crop
from disease_detection.disease_detection_inference import predict

# Import MCB components
try:
    from mcb.model_registry import model_registry, ModelType, InputType
    from mcb.decision_engine import decision_engine, UserContext, InputAnalysis
    from mcb.model_executor import ModelExecutor
    MCB_AVAILABLE = True
    print("✅ MCB system loaded successfully")
except ImportError as e:
    print(f"⚠️  MCB system not available: {e}")
    MCB_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Agriculture AI API with MCB",
    description="Unified API with Model Control Bridge for intelligent model selection",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crop Recommendation Models
class CropRecRequest(BaseModel):
    features: List[float]  # [N, P, K, temperature, humidity, ph, rainfall]

class CropRecResponse(BaseModel):
    crop: str

@app.post("/crop_rec/predict", response_model=CropRecResponse)
def predict_crop_endpoint(request: CropRecRequest):
    """
    Get crop recommendations based on soil and weather parameters
    """
    try:
        crop = predict_crop(request.features)
        return {"crop": crop}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Disease Detection Models
@app.post("/disease_detection/predict")
async def predict_disease_endpoint(file: UploadFile = File(...)):
    """
    Detect plant diseases from uploaded images
    """
    temp_path = None
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Save the uploaded file to a temporary location
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Predict disease
        result = predict(temp_path)
        
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

# Health check endpoint
@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "models": {
            "crop_recommendation": "available",
            "disease_detection": "available"
        },
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "Smart Agriculture AI API",
        "endpoints": {
            "crop_recommendation": "/crop_rec/predict",
            "disease_detection": "/disease_detection/predict",
            "health": "/health"
        },
        "docs": "/docs"
    }

# ===== MCB ENDPOINTS =====
if MCB_AVAILABLE:
    # MCB Pydantic models
    class ChatQuery(BaseModel):
        message: str = Field(..., description="User's message/query")
        user_id: str = Field(..., description="User ID")
        user_type: str = Field(default="farmer", description="User type")
        session_id: Optional[str] = Field(None, description="Session ID")
        location: Optional[str] = Field(None, description="User location")
        crop_types: Optional[List[str]] = Field(None, description="User's crop types")
        farm_size: Optional[float] = Field(None, description="Farm size")

    class ModelSelectionResponse(BaseModel):
        selected_model: Dict[str, Any]
        confidence: float
        reasoning: str
        required_inputs: Dict[str, Any]
        alternative_models: List[Dict[str, Any]]
        session_id: str

    class ExecutionRequest(BaseModel):
        model_id: str
        session_id: str
        inputs: Dict[str, Any]

    @app.post("/mcb/analyze", response_model=ModelSelectionResponse)
    async def mcb_analyze_query(query: ChatQuery):
        """MCB: Analyze user query and select best model"""
        try:
            user_context = UserContext(
                user_id=query.user_id,
                user_type=query.user_type,
                location=query.location,
                crop_types=query.crop_types,
                farm_size=query.farm_size
            )
            
            result = await decision_engine.analyze_and_select(
                query.message, user_context, query.session_id
            )
            
            return ModelSelectionResponse(**result)
        except Exception as e:
            logger.error(f"MCB analysis error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/mcb/execute")
    async def mcb_execute_model(request: ExecutionRequest):
        """MCB: Execute selected model with inputs"""
        try:
            executor = ModelExecutor()
            result = await executor.execute_model(
                request.model_id, request.inputs, request.session_id
            )
            return JSONResponse(content=result)
        except Exception as e:
            logger.error(f"MCB execution error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/mcb/models")
    async def mcb_get_models():
        """MCB: Get all available models"""
        try:
            models = model_registry.get_all_models()
            return {"models": models}
        except Exception as e:
            logger.error(f"MCB models error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/mcb/chat")
    async def mcb_chat_endpoint(query: ChatQuery):
        """MCB: Complete chat workflow - analyze, select, and execute"""
        try:
            user_context = UserContext(
                user_id=query.user_id,
                user_type=query.user_type,
                location=query.location,
                crop_types=query.crop_types,
                farm_size=query.farm_size
            )
            
            # Analyze and select model
            analysis = await decision_engine.analyze_and_select(
                query.message, user_context, query.session_id
            )
            
            # If model requires additional inputs, return selection info
            if analysis.get("requires_additional_input", False):
                return {
                    "type": "model_selection",
                    "analysis": analysis,
                    "message": "I need some additional information to help you better."
                }
            
            # Execute the selected model
            executor = ModelExecutor()
            result = await executor.execute_model(
                analysis["selected_model"]["id"],
                analysis.get("extracted_inputs", {}),
                analysis["session_id"]
            )
            
            return {
                "type": "complete_response",
                "analysis": analysis,
                "result": result,
                "message": result.get("response", "Analysis complete!")
            }
            
        except Exception as e:
            logger.error(f"MCB chat error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

else:
    @app.get("/mcb/status")
    async def mcb_status():
        return {"status": "MCB system not available", "available": False}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 