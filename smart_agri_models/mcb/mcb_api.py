"""
MCB API - FastAPI endpoints for Model Control Bridge
"""
from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import json
import logging
from datetime import datetime

from .model_registry import model_registry, ModelType, InputType
from .decision_engine import decision_engine, UserContext, InputAnalysis
from .model_executor import ModelExecutor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Model Control Bridge (MCB) API",
    description="Intelligent model selection and execution system for SmartAgriSys",
    version="1.0.0"
)

# Pydantic models for API
class ChatQuery(BaseModel):
    message: str = Field(..., description="User's message/query")
    user_id: str = Field(..., description="User ID")
    user_type: str = Field(default="farmer", description="User type: farmer, customer, admin")
    session_id: Optional[str] = Field(None, description="Session ID for context")
    location: Optional[str] = Field(None, description="User location")
    crop_types: Optional[List[str]] = Field(None, description="User's crop types")
    farm_size: Optional[float] = Field(None, description="Farm size in acres")

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

class ExecutionResponse(BaseModel):
    result: Dict[str, Any]
    model_used: str
    execution_time_ms: int
    confidence: Optional[float]

class ModelRegistryResponse(BaseModel):
    models: List[Dict[str, Any]]
    total_count: int

# Initialize model executor
model_executor = ModelExecutor()

@app.post("/mcb/analyze", response_model=ModelSelectionResponse)
async def analyze_query(query: ChatQuery):
    """
    Analyze user query and recommend the best model
    """
    try:
        # Create user context
        context = UserContext(
            user_id=query.user_id,
            user_type=query.user_type,
            location=query.location,
            crop_types=query.crop_types,
            farm_size=query.farm_size,
            session_id=query.session_id
        )
        
        # Analyze input
        analysis = decision_engine.analyze_input(
            user_input=query.message,
            context=context,
            has_image=False,  # Will be handled separately
            numerical_data=None
        )
        
        # Get model recommendation
        recommendation = decision_engine.recommend_model(analysis, context)
        
        # Generate session ID if not provided
        session_id = query.session_id or f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{query.user_id}"
        
        # Convert to response format
        response = ModelSelectionResponse(
            selected_model={
                "model_id": recommendation.model.model_id,
                "name": recommendation.model.name,
                "type": recommendation.model.model_type.value,
                "description": recommendation.model.description,
                "endpoint": recommendation.model.endpoint,
                "input_type": recommendation.model.input_type.value,
                "accuracy": recommendation.model.accuracy
            },
            confidence=recommendation.confidence,
            reasoning=recommendation.reasoning,
            required_inputs=recommendation.required_inputs,
            alternative_models=[
                {
                    "model_id": alt.model_id,
                    "name": alt.name,
                    "type": alt.model_type.value,
                    "accuracy": alt.accuracy
                }
                for alt in recommendation.alternative_models
            ],
            session_id=session_id
        )
        
        logger.info(f"Query analyzed for user {query.user_id}: {recommendation.model.name} selected")
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/mcb/analyze-with-image", response_model=ModelSelectionResponse)
async def analyze_query_with_image(
    message: str = Form(...),
    user_id: str = Form(...),
    user_type: str = Form(default="farmer"),
    session_id: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    file: UploadFile = File(...)
):
    """
    Analyze user query with uploaded image
    """
    try:
        logger.info(f"Analyzing image query from user {user_id}: '{message}'")
        
        # Validate image
        if not file.content_type or not file.content_type.startswith('image/'):
            logger.error(f"Invalid file type: {file.content_type}")
            raise HTTPException(status_code=400, detail="File must be an image")
        
        logger.info(f"Image file: {file.filename}, type: {file.content_type}, size: {file.size}")
        
        # Create user context
        context = UserContext(
            user_id=user_id,
            user_type=user_type,
            location=location,
            session_id=session_id
        )
        
        # Analyze input with image
        analysis = decision_engine.analyze_input(
            user_input=message,
            context=context,
            has_image=True,
            numerical_data=None
        )
        
        logger.info(f"Analysis result: intent={analysis.intent.value}, keywords={analysis.keywords_found}")
        
        # Get model recommendation
        recommendation = decision_engine.recommend_model(analysis, context)
        
        # Generate session ID if not provided
        session_id = session_id or f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_id}"
        
        response = ModelSelectionResponse(
            selected_model={
                "model_id": recommendation.model.model_id,
                "name": recommendation.model.name,
                "type": recommendation.model.model_type.value,
                "description": recommendation.model.description,
                "endpoint": recommendation.model.endpoint,
                "input_type": recommendation.model.input_type.value,
                "accuracy": recommendation.model.accuracy
            },
            confidence=recommendation.confidence,
            reasoning=recommendation.reasoning,
            required_inputs=recommendation.required_inputs,
            alternative_models=[
                {
                    "model_id": alt.model_id,
                    "name": alt.name,
                    "type": alt.model_type.value,
                    "accuracy": alt.accuracy
                }
                for alt in recommendation.alternative_models
            ],
            session_id=session_id
        )
        
        logger.info(f"Image query analyzed for user {user_id}: {recommendation.model.name} selected")
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing image query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/mcb/execute", response_model=ExecutionResponse)
async def execute_model(request: ExecutionRequest):
    """
    Execute the selected model with provided inputs
    """
    try:
        # Get model metadata
        model = model_registry.get_model(request.model_id)
        if not model:
            raise HTTPException(status_code=404, detail=f"Model {request.model_id} not found")
        
        if not model.is_active:
            raise HTTPException(status_code=400, detail=f"Model {request.model_id} is not active")
        
        # Execute model
        start_time = datetime.now()
        result = await model_executor.execute_model(model, request.inputs)
        end_time = datetime.now()
        
        execution_time = int((end_time - start_time).total_seconds() * 1000)
        
        response = ExecutionResponse(
            result=result,
            model_used=model.name,
            execution_time_ms=execution_time,
            confidence=result.get('confidence')
        )
        
        logger.info(f"Model {request.model_id} executed successfully in {execution_time}ms")
        return response
        
    except Exception as e:
        logger.error(f"Error executing model {request.model_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

@app.get("/mcb/models", response_model=ModelRegistryResponse)
async def get_models(
    model_type: Optional[str] = None,
    input_type: Optional[str] = None,
    active_only: bool = True
):
    """
    Get all registered models with optional filtering
    """
    try:
        models = model_registry.get_all_active_models() if active_only else list(model_registry.models.values())
        
        # Apply filters
        if model_type:
            try:
                mt = ModelType(model_type)
                models = [m for m in models if m.model_type == mt]
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid model_type: {model_type}")
        
        if input_type:
            try:
                it = InputType(input_type)
                models = [m for m in models if m.input_type == it]
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid input_type: {input_type}")
        
        # Convert to response format
        models_data = []
        for model in models:
            models_data.append({
                "model_id": model.model_id,
                "name": model.name,
                "type": model.model_type.value,
                "input_type": model.input_type.value,
                "description": model.description,
                "version": model.version,
                "accuracy": model.accuracy,
                "response_time_ms": model.response_time_ms,
                "endpoint": model.endpoint,
                "keywords": model.keywords,
                "is_active": model.is_active,
                "created_at": model.created_at.isoformat() if model.created_at else None,
                "last_updated": model.last_updated.isoformat() if model.last_updated else None
            })
        
        return ModelRegistryResponse(
            models=models_data,
            total_count=len(models_data)
        )
        
    except Exception as e:
        logger.error(f"Error getting models: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get models: {str(e)}")

@app.get("/mcb/health")
async def health_check():
    """
    Health check endpoint
    """
    active_models = len(model_registry.get_all_active_models())
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_models": active_models,
        "components": {
            "model_registry": "operational",
            "decision_engine": "operational",
            "model_executor": "operational"
        },
        "version": "1.0.0"
    }

@app.get("/mcb/stats")
async def get_stats():
    """
    Get MCB statistics
    """
    all_models = list(model_registry.models.values())
    active_models = [m for m in all_models if m.is_active]
    
    model_types = {}
    input_types = {}
    
    for model in active_models:
        model_type = model.model_type.value
        input_type = model.input_type.value
        
        model_types[model_type] = model_types.get(model_type, 0) + 1
        input_types[input_type] = input_types.get(input_type, 0) + 1
    
    avg_accuracy = sum(m.accuracy for m in active_models) / len(active_models) if active_models else 0
    avg_response_time = sum(m.response_time_ms for m in active_models) / len(active_models) if active_models else 0
    
    return {
        "total_models": len(all_models),
        "active_models": len(active_models),
        "inactive_models": len(all_models) - len(active_models),
        "model_types": model_types,
        "input_types": input_types,
        "average_accuracy": round(avg_accuracy, 3),
        "average_response_time_ms": round(avg_response_time, 1),
        "last_updated": datetime.now().isoformat()
    }

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint with MCB information
    """
    return {
        "service": "Model Control Bridge (MCB)",
        "description": "Intelligent model selection and execution system",
        "version": "1.0.0",
        "endpoints": {
            "analyze_query": "/mcb/analyze",
            "analyze_with_image": "/mcb/analyze-with-image", 
            "execute_model": "/mcb/execute",
            "get_models": "/mcb/models",
            "health_check": "/mcb/health",
            "statistics": "/mcb/stats"
        },
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
