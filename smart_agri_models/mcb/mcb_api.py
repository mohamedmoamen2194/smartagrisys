"""
MCB API - FastAPI endpoints for Model Control Bridge
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import tempfile
import os
import base64

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

# Initialize model executor with direct model access
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


@app.post("/mcb/ask", response_class=PlainTextResponse)
async def ask_mcb(query: ChatQuery):
    """
    Ask MCB a question and get a human-readable text response
    """
    try:
        # Create user context
        context = UserContext(
            user_id=query.user_id,
            user_type=query.user_type,
            location=query.location,
            crop_types=query.crop_types,
            farm_size=query.farm_size
        )
        
        # Use LLM to analyze query and select model intelligently
        llm_analysis = decision_engine.llm_selector.analyze_and_select_model(
            user_query=query.message,
            has_image=False,
            context=context
        )
        
        selected_model = llm_analysis.get('selected_model')
        extracted_data = llm_analysis.get('extracted_data', {})
        confidence = llm_analysis.get('confidence', 0.8)
        reasoning = llm_analysis.get('reasoning', 'LLM analysis')
        
        # Handle different model selections
        if selected_model == 'general_help':
            response_text = f"""👋 Hello! I'm your AI-powered agricultural assistant.

🌱 **I can help you with:**
- **Crop Recommendations** - Ask "What crop should I plant?" or provide soil data
- **Disease Detection** - Upload plant images or describe symptoms
- **Farming Advice** - General agricultural guidance

📝 **Example questions:**
- "What crop is best for nitrogen 25, phosphorus 20?"
- "My tomato plants have brown spots"
- "I need farming advice for my area"

🔍 **For disease diagnosis:** Upload a clear photo of affected plant parts
🌾 **For crop recommendations:** Provide soil conditions or ask for suggestions

What would you like help with today?"""
            return response_text
            
        elif selected_model == 'disease_detection':
            response_text = f"""🔍 DISEASE DETECTION

Based on your query: "{query.message}"

I can help diagnose plant diseases, but I need an image of the affected plant.

Please use the /mcb/diagnose-image endpoint and upload a photo of:
- Affected leaves showing symptoms
- Plant parts with visible problems
- Clear, well-lit images work best

WHAT I CAN DETECT:
- Early blight, late blight
- Leaf spots and rust
- Bacterial and fungal infections
- Nutrient deficiencies

{f"Detected symptoms: {', '.join(extracted_data.get('disease_symptoms', []))}" if extracted_data.get('disease_symptoms') else ""}

Would you like to upload an image for diagnosis?"""
            return response_text
            
        elif selected_model == 'crop_recommendation':
            # Get crop recommendation model
            crop_model = model_registry.get_model('crop_recommendation_v1')
            if not crop_model:
                return "Sorry, crop recommendation model is not available."
                
            # Check if LLM extracted specific crops or features
            mentioned_crops = extracted_data.get('mentioned_crops', [])
            crop_features = extracted_data.get('crop_features', [])
            user_intent = extracted_data.get('user_intent', '')

            # DEBUG: Log the extracted data
            logger.info(f"MCB API - Extracted data: {extracted_data}")
            logger.info(f"MCB API - Crop features: {crop_features}")
            logger.info(f"MCB API - Features length: {len(crop_features) if crop_features else 0}")
            
            # If user mentioned specific crops, provide targeted advice
            if mentioned_crops:
                # User mentioned specific crops - provide targeted advice
                primary_crop = mentioned_crops[0]
                response_text = f"""🌱 CROP RECOMMENDATION

Based on your query: "{query.message}"

You mentioned **{primary_crop.upper()}** - that's a great choice!

🌾 **{primary_crop.title()} Growing Guide:**
- **Best Season**: Depends on your location and climate
- **Soil Requirements**: Well-drained, fertile soil
- **Water Needs**: Regular irrigation during growing season
- **Expected Yield**: Varies by variety and conditions

💡 **Recommendations for {primary_crop.title()}:**
- Choose varieties suited to your local climate
- Ensure proper soil preparation and fertilization
- Monitor for common pests and diseases
- Consider crop rotation for soil health

📊 **For detailed soil analysis and precise recommendations:**
Please provide your soil test results (N, P, K levels, pH, etc.)

Would you like specific advice about {primary_crop} cultivation in your area?"""
                return response_text
            else:
                # Use ML model with LLM-extracted features
                # FIX: Ensure crop_features is valid and has no None values
                if (crop_features and 
                    len(crop_features) == 7 and 
                    all(f is not None for f in crop_features)):
                    # LLM extracted proper features - convert to float to ensure no None values
                    inputs = {"features": [float(f) for f in crop_features]}
                    data_source = "LLM extracted from query"
                    logger.info(f"MCB API - Using extracted features: {inputs['features']}")
                else:
                    # LLM didn't extract features or has None values - use intelligent defaults
                    inputs = {"features": [30, 25, 35, 25, 70, 6.8, 150]}  # Balanced defaults
                    data_source = "Default agricultural values"
                    logger.info(f"MCB API - Using default features: {inputs['features']}")
                    logger.warning(f"MCB API - Crop features validation failed: {crop_features}")
                    
                # Execute the crop recommendation model
                result = await model_executor.execute_model(crop_model, inputs)
                crop_result = result.get('result', result)
                
                # Use LLM to refine the output into human-readable response
                refinement_prompt = f"""You are an agricultural expert. Take this ML model output and create a helpful, human-readable response.

User Query: "{query.message}"
User Intent: {user_intent}
Model Prediction: {crop_result.get('crop', 'Unknown')}
Confidence: {crop_result.get('confidence', 0):.0%}
Input Features Used: {inputs['features']} (N, P, K, temp, humidity, pH, rainfall)
Data Source: {data_source}

Create a comprehensive, helpful response that:
1. Acknowledges their query
2. Explains the recommendation 
3. Provides practical growing advice
4. Mentions the soil conditions used
5. Suggests next steps

Make it conversational and helpful, not technical."""

                try:
                    llm_response = decision_engine.llm_selector.call_llm(refinement_prompt)
                    
                    # Extract response from LLM output - handle nested structures
                    if isinstance(llm_response, dict):
                        # Check for nested response structure
                        if 'response' in llm_response and isinstance(llm_response['response'], dict):
                            if 'text' in llm_response['response']:
                                response_text = llm_response['response']['text']
                            elif 'content' in llm_response['response']:
                                response_text = llm_response['response']['content']
                            else:
                                response_text = str(llm_response['response'])
                        elif 'response' in llm_response:
                            response_text = llm_response['response']
                        elif 'content' in llm_response:
                            response_text = llm_response['content']
                        else:
                            # Try to get the first string value
                            response_text = str(list(llm_response.values())[0]) if llm_response else None
                    elif isinstance(llm_response, str):
                        response_text = llm_response
                    else:
                        response_text = None
                        
                except Exception as e:
                    logger.error(f"LLM refinement failed: {e}")
                    response_text = None
                
                # Fallback to structured format if LLM refinement fails
                if not response_text:
                    response_text = f"""🌱 CROP RECOMMENDATION

Based on your query: "{query.message}"

**RECOMMENDED CROP: {crop_result.get('crop', 'Unknown').upper()}**
Confidence: {crop_result.get('confidence', 0):.0%}

📊 **Analysis Details:**
- Data Source: {data_source}
- Soil Conditions: N={inputs['features'][0]:.1f}, P={inputs['features'][1]:.1f}, K={inputs['features'][2]:.1f}
- Climate: Temp={inputs['features'][3]:.1f}°C, Humidity={inputs['features'][4]:.1f}%, pH={inputs['features'][5]:.1f}
- Rainfall: {inputs['features'][6]:.1f}mm

💡 **Recommendation:**
This crop is well-suited to your conditions. For best results, ensure proper soil preparation and choose varieties adapted to your local climate.

🌾 **Next Steps:**
1. Test your soil for precise nutrient levels
2. Select appropriate varieties for your region
3. Plan planting according to local growing seasons"""
                
                return response_text
        
        else:
            return f"Unknown model selection: {selected_model}"
            
    except Exception as e:
        logger.error(f"Error in ask endpoint: {str(e)}")
        return f"Sorry, I encountered an error processing your request: {str(e)}"

@app.post("/mcb/diagnose-image", response_class=PlainTextResponse)
async def diagnose_plant_image(
    request: Request
):
    """
    Diagnose plant disease from uploaded image with text response
    """
    try:
        # Parse form data manually
        form = await request.form()
        logger.info(f"Received form data with keys: {list(form.keys())}")
        
        # Extract form fields
        file = form.get('file')
        message = form.get('message', 'Please diagnose this plant disease')
        user_id = form.get('user_id', 'anonymous')
        
        logger.info(f"Received image upload request from user: {user_id}")
        
        if not file:
            return "Error: No image file found in request. Please upload an image."
        
        logger.info(f"File info - filename: {file.filename}, content_type: {file.content_type}")
        
        # Read and encode image
        image_data = await file.read()
        logger.info(f"Image data read successfully, size: {len(image_data)} bytes")
        
        # Validate image
        if len(image_data) == 0:
            return "Error: Empty image file received."
        
        # Check file size (limit to 10MB)
        if len(image_data) > 10 * 1024 * 1024:
            return "Error: Image file too large. Please use an image smaller than 10MB."
        
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Get disease detection model
        disease_model = model_registry.get_model('disease_detection_v1')
        if not disease_model:
            return "Disease detection model is not available at the moment."
        
        logger.info(f"Processing disease detection for user: {user_id}")
        
        # Execute disease detection
        inputs = {"image": image_base64}
        result = await model_executor.execute_model(disease_model, inputs)
        
        # Format disease detection response
        # The model executor returns the enhanced result directly, not nested under 'result'
        disease_result = result.get('result', result)  # Handle both structures
        
        response_text = f"""🔍 PLANT DISEASE DIAGNOSIS

IMAGE ANALYSIS COMPLETE

DETECTED DISEASE: {disease_result['disease'].replace('_', ' ').title()}
Confidence: {disease_result['confidence']:.0%}
Severity: {disease_result.get('severity', 'MEDIUM')}
Urgency: {disease_result.get('urgency', 'Monitor closely')}

TREATMENT RECOMMENDATIONS:
"""
        
        for i, treatment in enumerate(disease_result.get('treatment_recommendations', []), 1):
            response_text += f"{i}. {treatment}\n"
        
        response_text += f"""
NEXT STEPS:
- Follow treatment recommendations immediately
- Monitor plant progress daily
- Remove affected plant parts safely
- Improve growing conditions as suggested

Analysis completed in {result.get('execution_time_ms', 'N/A')}ms
Analyzed on: {disease_result.get('analysis_timestamp', 'now')}"""
        
        return response_text
        
    except Exception as e:
        logger.error(f"Error in diagnose-image endpoint: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return f"Sorry, I couldn't analyze the image: {str(e)}"

@app.post("/mcb/diagnose-image-debug", response_class=PlainTextResponse)
async def diagnose_plant_image_debug(request: Request):
    """
    Debug endpoint for image diagnosis - accepts any form data structure
    """
    try:
        form = await request.form()
        logger.info(f"Debug endpoint - received form keys: {list(form.keys())}")
        
        # Try to find the image file in different possible keys
        image_file = None
        for key in ['file', 'image', 'photo', 'upload']:
            if key in form:
                image_file = form[key]
                logger.info(f"Found image file under key: {key}")
                break
        
        if not image_file:
            return f"Error: No image file found. Available keys: {list(form.keys())}"
        
        # Process the image
        image_data = await image_file.read()
        logger.info(f"Image data size: {len(image_data)} bytes")
        
        if len(image_data) == 0:
            return "Error: Empty image file received."
        
        # Get other form data
        message = form.get('message', 'Please diagnose this plant disease')
        user_id = form.get('user_id', 'anonymous')
        
        # Continue with normal processing...
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Get disease detection model
        disease_model = model_registry.get_model('disease_detection_v1')
        if not disease_model:
            return "Disease detection model is not available at the moment."
        
        # Execute disease detection
        inputs = {"image": image_base64}
        result = await model_executor.execute_model(disease_model, inputs)
        
        # Format response (simplified for debug)
        disease_result = result.get('result', result)
        
        return f"""🔍 DEBUG - PLANT DISEASE DIAGNOSIS

DETECTED DISEASE: {disease_result.get('disease', 'Unknown')}
Confidence: {disease_result.get('confidence', 0):.0%}

This is a debug response to test image processing."""
        
    except Exception as e:
        logger.error(f"Error in debug diagnose-image endpoint: {str(e)}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return f"Debug Error: {str(e)}"

@app.get("/mcb/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mcb_available": True,
        "models_loaded": len(model_registry.get_all_active_models()),
        "version": "2.0.0-real"
    }

@app.post("/mcb/test-image", response_class=PlainTextResponse)
async def test_image_upload(request: Request):
    """Simple test endpoint for image uploads"""
    try:
        form = await request.form()
        logger.info(f"Test endpoint - received form keys: {list(form.keys())}")
        
        file = form.get('file')
        if not file:
            return "No file received"
        
        image_data = await file.read()
        return f"✅ Image received successfully! Size: {len(image_data)} bytes, Filename: {file.filename}"
        
    except Exception as e:
        logger.error(f"Test endpoint error: {e}")
        return f"❌ Test failed: {str(e)}"

@app.get("/mcb/help", response_class=PlainTextResponse)
async def get_help():
    """
    Get help information in text format
    """
    return """🤖 MCB - MODEL CONTROL BRIDGE HELP

WHAT I CAN DO:
- Recommend crops based on soil conditions
- Diagnose plant diseases from images
- Provide farming advice and tips

HOW TO USE:

1. ASK QUESTIONS (Text):
   POST /mcb/ask
   Example: "What crop should I plant with nitrogen 25, phosphorus 20?"

2. DIAGNOSE DISEASES (Image):
   POST /mcb/diagnose-image
   Upload a photo of affected plant parts

3. GET HELP:
   GET /mcb/help (this page)

EXAMPLE QUESTIONS:
- "What crop is best for my soil conditions?"
- "My tomato plants have brown spots"
- "Recommend crops for Kenya climate"
- "What fertilizer should I use?"

SUPPORTED FORMATS:
- Text queries in English
- Image formats: JPG, PNG, JPEG
- Soil data: N, P, K, temperature, humidity, pH, rainfall

For technical API documentation, visit: /docs

Happy farming! 🌱"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
