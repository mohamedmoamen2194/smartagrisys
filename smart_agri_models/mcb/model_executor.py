"""
Model Executor - Handles actual model execution and result processing
"""
import aiohttp
import asyncio
import json
import tempfile
import os
from typing import Dict, Any, Optional
import logging
from datetime import datetime

from .model_registry import ModelMetadata, ModelType, InputType

logger = logging.getLogger(__name__)

class ModelExecutor:
    """Executes models and processes results"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = None
    
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def execute_model(self, model: ModelMetadata, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a model with given inputs"""
        
        try:
            if model.model_type == ModelType.DISEASE_DETECTION:
                return await self._execute_disease_detection(model, inputs)
            elif model.model_type == ModelType.CROP_RECOMMENDATION:
                return await self._execute_crop_recommendation(model, inputs)
            elif model.model_type == ModelType.FRUIT_SIZING:
                return await self._execute_fruit_sizing(model, inputs)
            else:
                raise ValueError(f"Unsupported model type: {model.model_type}")
                
        except Exception as e:
            logger.error(f"Error executing model {model.model_id}: {str(e)}")
            raise
    
    async def _execute_disease_detection(self, model: ModelMetadata, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute disease detection model"""
        
        if 'image' not in inputs:
            raise ValueError("Disease detection requires an image input")
        
        session = await self._get_session()
        url = f"{self.base_url}{model.endpoint}"
        
        # Handle different image input formats
        image_data = inputs['image']
        
        if isinstance(image_data, str):
            # Base64 encoded image
            import base64
            image_bytes = base64.b64decode(image_data)
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                temp_file.write(image_bytes)
                temp_file_path = temp_file.name
            
            try:
                with open(temp_file_path, 'rb') as f:
                    data = aiohttp.FormData()
                    data.add_field('file', f, filename='image.jpg', content_type='image/jpeg')
                    
                    async with session.post(url, data=data) as response:
                        if response.status == 200:
                            result = await response.json()
                            return self._enhance_disease_result(result)
                        else:
                            error_text = await response.text()
                            raise Exception(f"Model execution failed: {error_text}")
            finally:
                # Clean up temp file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
        
        elif hasattr(image_data, 'read'):
            # File-like object
            data = aiohttp.FormData()
            data.add_field('file', image_data, filename='image.jpg', content_type='image/jpeg')
            
            async with session.post(url, data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    return self._enhance_disease_result(result)
                else:
                    error_text = await response.text()
                    raise Exception(f"Model execution failed: {error_text}")
        
        else:
            raise ValueError("Invalid image format. Expected base64 string or file-like object")
    
    async def _execute_crop_recommendation(self, model: ModelMetadata, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Execute crop recommendation model"""
        
        # Extract features from inputs
        if 'features' in inputs:
            features = inputs['features']
        elif 'soil_data' in inputs:
            # Convert soil data to features array
            soil_data = inputs['soil_data']
            features = [
                soil_data.get('nitrogen', 0),
                soil_data.get('phosphorus', 0),
                soil_data.get('potassium', 0),
                soil_data.get('temperature', 25),
                soil_data.get('humidity', 50),
                soil_data.get('ph', 7),
                soil_data.get('rainfall', 100)
            ]
        else:
            raise ValueError("Crop recommendation requires features or soil_data")
        
        session = await self._get_session()
        url = f"{self.base_url}{model.endpoint}"
        
        payload = {"features": features}
        
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                result = await response.json()
                return self._enhance_crop_result(result, features)
            else:
                error_text = await response.text()
                raise Exception(f"Model execution failed: {error_text}")
    
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
        
        # Add treatment recommendations based on disease
        disease = result.get('disease', '').lower()
        
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
            if disease_type in disease:
                enhanced_result['treatment_recommendations'] = treatments
                break
        
        if 'treatment_recommendations' not in enhanced_result:
            enhanced_result['treatment_recommendations'] = [
                "Consult with agricultural extension service",
                "Remove affected plant parts",
                "Monitor plant health regularly",
                "Consider organic treatment options"
            ]
        
        # Add severity assessment
        confidence = result.get('confidence', 0)
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
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
