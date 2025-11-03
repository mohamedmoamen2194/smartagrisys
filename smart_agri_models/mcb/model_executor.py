"""
Model Executor - Handles actual model execution and result processing
"""
import asyncio
import json
import tempfile
import os
import base64
import numpy as np
import requests
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime
from PIL import Image
import io

# Import your actual model inference functions
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from crop_rec.crop_recommendation_inference import predict_crop
from disease_detection.disease_detection_inference import predict

from .model_registry import ModelMetadata, ModelType, InputType

logger = logging.getLogger(__name__)

class ModelExecutor:
    """Executes models and processes results using your trained models directly"""
    
    def __init__(self):
        """Initialize model executor with direct model access"""
        logger.info("ModelExecutor initialized with direct model access")
        
    def _validate_inputs(self, model: ModelMetadata, inputs: Dict[str, Any]) -> None:
        """Validate inputs for the specific model"""
        if model.model_type == ModelType.DISEASE_DETECTION:
            if 'image' not in inputs:
                raise ValueError("Disease detection requires an 'image' input")
        elif model.model_type == ModelType.CROP_RECOMMENDATION:
            if 'features' not in inputs and 'soil_data' not in inputs:
                raise ValueError("Crop recommendation requires 'features' or 'soil_data' input")
    
    async def execute_model(self, model: ModelMetadata, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a model with given inputs"""
        
        start_time = datetime.now()
        
        try:
            if model.model_type == ModelType.DISEASE_DETECTION:
                result = await self._execute_disease_detection(model, inputs)
            elif model.model_type == ModelType.CROP_RECOMMENDATION:
                result = await self._execute_crop_recommendation(model, inputs)
            elif model.model_type == ModelType.FRUIT_SIZING:
                result = await self._execute_fruit_sizing(model, inputs)
            else:
                raise ValueError(f"Unsupported model type: {model.model_type}")
            
            # Add execution time
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            result['execution_time_ms'] = int(execution_time)
            
            return result
                
        except Exception as e:
            logger.error(f"Error executing model {model.model_id}: {str(e)}")
            raise
    
    async def _execute_disease_detection(self, model: ModelMetadata, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute disease detection model using your trained model directly"""
        
        self._validate_inputs(model, inputs)
        
        image_data = inputs['image']
        temp_file_path = None
        
        try:
            # Handle different image input formats and create temporary file
            if isinstance(image_data, str):
                # Base64 encoded image
                try:
                    # Remove data URL prefix if present
                    if image_data.startswith('data:image'):
                        image_data = image_data.split(',')[1]
                    
                    image_bytes = base64.b64decode(image_data)
                    
                    # Create temporary file for your model
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                        temp_file.write(image_bytes)
                        temp_file_path = temp_file.name
                        
                except Exception as e:
                    raise ValueError(f"Invalid base64 image data: {str(e)}")
                    
            elif hasattr(image_data, 'read'):
                # File-like object
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    temp_file.write(image_data.read())
                    temp_file_path = temp_file.name
                    
            elif isinstance(image_data, bytes):
                # Raw bytes
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                    temp_file.write(image_data)
                    temp_file_path = temp_file.name
                    
            else:
                raise ValueError("Invalid image format. Expected base64 string, bytes, or file-like object")
            
            # Validate image file
            try:
                with Image.open(temp_file_path) as img:
                    if img.format not in ['JPEG', 'PNG', 'JPG']:
                        logger.warning(f"Image format {img.format} may not be optimal")
            except Exception as e:
                raise ValueError(f"Invalid image file: {str(e)}")
            
            # Execute your actual disease detection model
            logger.info(f"Executing disease detection on image: {temp_file_path}")
            result = predict(temp_file_path)  # This uses your trained model with proper preprocessing
            
            # Enhance result with additional information
            enhanced_result = self._enhance_disease_result(result)
            
            logger.info(f"Disease detection completed: {result.get('disease', 'Unknown')} (confidence: {result.get('confidence', 0):.2f})")
            
            return enhanced_result
            
        except Exception as e:
            logger.error(f"Disease detection execution failed: {str(e)}")
            raise
            
        finally:
            # Clean up temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                except Exception as e:
                    logger.warning(f"Failed to clean up temp file {temp_file_path}: {str(e)}")
    
    async def _execute_crop_recommendation(self, model: ModelMetadata, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute crop recommendation model using your trained model directly"""
        
        self._validate_inputs(model, inputs)
        
        try:
            # Extract and validate features
            if 'features' in inputs:
                features = inputs['features']
            elif 'soil_data' in inputs:
                # Convert soil data to features array [N, P, K, temperature, humidity, pH, rainfall]
                soil_data = inputs['soil_data']
                features = [
                    float(soil_data.get('nitrogen', 20)),      # N
                    float(soil_data.get('phosphorus', 15)),    # P  
                    float(soil_data.get('potassium', 25)),     # K
                    float(soil_data.get('temperature', 25)),   # Temperature (°C)
                    float(soil_data.get('humidity', 60)),      # Humidity (%)
                    float(soil_data.get('ph', 6.5)),          # pH
                    float(soil_data.get('rainfall', 100))     # Rainfall (mm)
                ]
            else:
                raise ValueError("Crop recommendation requires 'features' or 'soil_data'")
            
            # Validate features array
            if not isinstance(features, (list, tuple, np.ndarray)):
                raise ValueError("Features must be a list, tuple, or numpy array")
            
            if len(features) != 7:
                raise ValueError(f"Features must contain exactly 7 values [N,P,K,temp,humidity,pH,rainfall], got {len(features)}")
            
            # Convert to proper format for your model
            features = [float(f) for f in features]
            
            logger.info(f"Executing crop recommendation with features: {features}")
            
            # Execute your actual crop recommendation model
            crop_prediction = predict_crop(features)  # This uses your trained Random Forest model
            
            # Create result in expected format
            result = {
                'crop': crop_prediction,
                'confidence': 0.85  # Your model doesn't return confidence, so we use a default
            }
            
            # Enhance result with additional information
            enhanced_result = self._enhance_crop_result(result, features)
            
            logger.info(f"Crop recommendation completed: {crop_prediction}")
            
            return enhanced_result
            
        except Exception as e:
            logger.error(f"Crop recommendation execution failed: {str(e)}")
            raise
    
    async def _execute_fruit_sizing(self, model: ModelMetadata, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute fruit sizing model (placeholder - implement when model is available)"""
        
        # This is a placeholder implementation
        # You would implement the actual fruit sizing model execution here
        
        return {
            "grade": "A",
            "avg_diameter": 7.5,
            "avg_weight": 150.0,
            "color_uniformity": 0.85,
            "defects": [],
            "harvest_ready": True,
            "confidence": 0.88,
            "message": "Fruit sizing analysis completed (placeholder)"
        }
    
    def _enhance_disease_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance disease detection result with additional information"""
        
        enhanced_result = result.copy()
        
        # Try to get dynamic treatment recommendations
        disease = result.get('disease', '')
        confidence = result.get('confidence', 0)
        
        try:
            # Use LLM for dynamic treatment recommendations if available
            dynamic_treatments = self._get_dynamic_treatment_recommendations(disease, confidence)
            if dynamic_treatments:
                enhanced_result['treatment_recommendations'] = dynamic_treatments
            else:
                enhanced_result['treatment_recommendations'] = self._get_static_treatment_recommendations(disease)
        except Exception as e:
            logger.warning(f"Failed to get dynamic treatments: {e}")
            enhanced_result['treatment_recommendations'] = self._get_static_treatment_recommendations(disease)
        
        # Add severity assessment
        if confidence > 0.8:
            enhanced_result['severity'] = 'HIGH'
            enhanced_result['urgency'] = 'Immediate action required'
        elif confidence > 0.6:
            enhanced_result['severity'] = 'MEDIUM'
            enhanced_result['urgency'] = 'Action needed within 24-48 hours'
        else:
            enhanced_result['severity'] = 'LOW'
            enhanced_result['urgency'] = 'Monitor and take preventive measures'
        
        # Add timestamp
        enhanced_result['analysis_timestamp'] = datetime.now().isoformat()
        
        return enhanced_result
    
    def _get_dynamic_treatment_recommendations(self, disease: str, confidence: float) -> Optional[List[str]]:
        """Get dynamic treatment recommendations using LLM - Vercel compatible"""
        
        # Check if LLM is available
        api_key = os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key or not os.getenv("MCB_DYNAMIC_TREATMENTS", "true").lower() == "true":
            return None
        
        try:
            prompt = f"""Provide treatment recommendations for the plant disease: "{disease}"
            
Detection confidence: {confidence:.2f}

Instructions:
1. Provide 4-6 specific, actionable treatment steps
2. Include both immediate and preventive measures
3. Consider organic and chemical options
4. Be practical for farmers
5. Prioritize by urgency

Respond ONLY with valid JSON in this format:
{{
    "treatments": [
        "Immediate action 1",
        "Treatment step 2", 
        "Prevention measure 3",
        "Long-term care 4"
    ],
    "urgency": "high|medium|low",
    "organic_options": ["organic treatment 1", "organic treatment 2"]
}}"""

            # Make API call (reuse the LLM calling logic)
            provider = os.getenv("LLM_PROVIDER", "groq")
            
            if provider == "groq":
                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 300,
                        "temperature": 0.1
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result['choices'][0]['message']['content']
                    treatment_data = json.loads(content)
                    return treatment_data.get('treatments', [])
            
        except Exception as e:
            logger.warning(f"Dynamic treatment generation failed: {e}")
            
        return None
    
    def _get_static_treatment_recommendations(self, disease: str) -> List[str]:
        """Fallback static treatment recommendations"""
        
        disease_lower = disease.lower()
        
        treatment_recommendations = {
            'blight': [
                "Remove affected leaves immediately",
                "Apply copper-based fungicide",
                "Improve air circulation",
                "Avoid overhead watering"
            ],
            'rust': [
                "Apply fungicide containing myclobutanil",
                "Remove infected plant debris",
                "Ensure proper spacing between plants",
                "Water at soil level"
            ],
            'spot': [
                "Remove affected foliage",
                "Apply preventive fungicide spray",
                "Improve drainage",
                "Avoid working with wet plants"
            ]
        }
        
        # Find matching treatment
        for disease_type, treatments in treatment_recommendations.items():
            if disease_type in disease_lower:
                return treatments
        
        # Default recommendations
        return [
            "Consult with agricultural extension service",
            "Remove affected plant parts",
            "Monitor plant health regularly",
            "Consider organic treatment options"
        ]
    
    def _enhance_crop_result(self, result: Dict[str, Any], features: list) -> Dict[str, Any]:
        """Enhance crop recommendation result with additional information"""
        
        enhanced_result = result.copy()
        
        # Add input interpretation
        enhanced_result['input_analysis'] = {
            'nitrogen': features[0],
            'phosphorus': features[1],
            'potassium': features[2],
            'temperature': features[3],
            'humidity': features[4],
            'ph': features[5],
            'rainfall': features[6]
        }
        
        # Add soil condition assessment
        n, p, k = features[0], features[1], features[2]
        ph = features[5]
        
        soil_conditions = []
        if n < 20:
            soil_conditions.append("Low nitrogen - consider nitrogen-rich fertilizer")
        elif n > 80:
            soil_conditions.append("High nitrogen - may cause excessive vegetative growth")
        
        if p < 10:
            soil_conditions.append("Low phosphorus - add phosphate fertilizer")
        elif p > 60:
            soil_conditions.append("High phosphorus - monitor for nutrient imbalance")
        
        if k < 15:
            soil_conditions.append("Low potassium - add potash fertilizer")
        elif k > 70:
            soil_conditions.append("High potassium - ensure balanced nutrition")
        
        if ph < 6.0:
            soil_conditions.append("Acidic soil - consider lime application")
        elif ph > 8.0:
            soil_conditions.append("Alkaline soil - may need sulfur amendment")
        
        enhanced_result['soil_recommendations'] = soil_conditions
        
        # Add alternative crops based on conditions
        crop = result.get('crop', '').lower()
        
        alternative_crops = {
            'rice': ['wheat', 'corn', 'barley'],
            'wheat': ['rice', 'oats', 'rye'],
            'corn': ['sorghum', 'millet', 'sunflower'],
            'cotton': ['soybean', 'peanut', 'sesame'],
            'soybean': ['corn', 'wheat', 'cotton']
        }
        
        enhanced_result['alternative_crops'] = alternative_crops.get(crop, [])
        
        # Add planting recommendations
        temp = features[3]
        humidity = features[4]
        rainfall = features[6]
        
        planting_tips = []
        if temp < 15:
            planting_tips.append("Consider cold-resistant varieties")
        elif temp > 35:
            planting_tips.append("Choose heat-tolerant varieties")
        
        if humidity < 30:
            planting_tips.append("Implement irrigation system")
        elif humidity > 80:
            planting_tips.append("Ensure good drainage and air circulation")
        
        if rainfall < 50:
            planting_tips.append("Plan for supplemental irrigation")
        elif rainfall > 200:
            planting_tips.append("Implement drainage systems")
        
        enhanced_result['planting_recommendations'] = planting_tips
        enhanced_result['analysis_timestamp'] = datetime.now().isoformat()
        
        return enhanced_result
    
    async def close(self):
        """Cleanup method (no longer needed since we're using direct model access)"""
        pass
