"""
Model Registry - Central registry for all available AI models
"""
from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import json
from datetime import datetime

class ModelType(Enum):
    DISEASE_DETECTION = "disease_detection"
    CROP_RECOMMENDATION = "crop_recommendation"
    FRUIT_SIZING = "fruit_sizing"
    SOIL_ANALYSIS = "soil_analysis"
    WEATHER_PREDICTION = "weather_prediction"

class InputType(Enum):
    IMAGE = "image"
    NUMERICAL = "numerical"
    TEXT = "text"
    SENSOR_DATA = "sensor_data"

@dataclass
class ModelMetadata:
    """Metadata for each registered model"""
    model_id: str
    name: str
    model_type: ModelType
    input_type: InputType
    description: str
    version: str
    accuracy: float
    response_time_ms: int
    endpoint: str
    keywords: List[str]
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    is_active: bool = True
    created_at: datetime = None
    last_updated: datetime = None

class ModelRegistry:
    """Central registry for all AI models"""
    
    def __init__(self):
        self.models: Dict[str, ModelMetadata] = {}
        self._initialize_default_models()
    
    def _initialize_default_models(self):
        """Initialize with existing models"""
        
        # Disease Detection Model
        disease_model = ModelMetadata(
            model_id="disease_detection_v1",
            name="Plant Disease Detection",
            model_type=ModelType.DISEASE_DETECTION,
            input_type=InputType.IMAGE,
            description="Detects plant diseases from leaf images using MobileNetV2",
            version="1.0.0",
            accuracy=0.94,
            response_time_ms=1200,
            endpoint="/disease_detection/predict",
            keywords=[
                "disease", "plant", "leaf", "sick", "infection", "pest", 
                "fungus", "bacteria", "virus", "blight", "spot", "rot",
                "yellowing", "wilting", "damaged", "unhealthy"
            ],
            input_schema={
                "type": "multipart/form-data",
                "fields": {
                    "file": {
                        "type": "file",
                        "formats": ["jpg", "jpeg", "png", "webp"],
                        "max_size_mb": 10
                    }
                }
            },
            output_schema={
                "disease": "string",
                "confidence": "float",
                "treatment_recommendations": "array"
            }
        )
        
        # Crop Recommendation Model
        crop_model = ModelMetadata(
            model_id="crop_recommendation_v1",
            name="Crop Recommendation System",
            model_type=ModelType.CROP_RECOMMENDATION,
            input_type=InputType.NUMERICAL,
            description="Recommends optimal crops based on soil and weather conditions",
            version="1.0.0",
            accuracy=0.89,
            response_time_ms=800,
            endpoint="/crop_rec/predict",
            keywords=[
                "crop", "recommendation", "soil", "weather", "nitrogen", "phosphorus",
                "potassium", "temperature", "humidity", "ph", "rainfall", "fertilizer",
                "planting", "growing", "harvest", "yield", "best crop", "suitable"
            ],
            input_schema={
                "type": "application/json",
                "fields": {
                    "features": {
                        "type": "array",
                        "length": 7,
                        "description": "[N, P, K, temperature, humidity, ph, rainfall]"
                    }
                }
            },
            output_schema={
                "crop": "string",
                "confidence": "float",
                "alternative_crops": "array"
            }
        )
        
        self.register_model(disease_model)
        self.register_model(crop_model)
    
    def register_model(self, model: ModelMetadata) -> bool:
        """Register a new model"""
        if model.created_at is None:
            model.created_at = datetime.now()
        model.last_updated = datetime.now()
        
        self.models[model.model_id] = model
        return True
    
    def get_model(self, model_id: str) -> Optional[ModelMetadata]:
        """Get model by ID"""
        return self.models.get(model_id)
    
    def get_models_by_type(self, model_type: ModelType) -> List[ModelMetadata]:
        """Get all models of a specific type"""
        return [model for model in self.models.values() 
                if model.model_type == model_type and model.is_active]
    
    def get_models_by_input_type(self, input_type: InputType) -> List[ModelMetadata]:
        """Get all models that accept a specific input type"""
        return [model for model in self.models.values() 
                if model.input_type == input_type and model.is_active]
    
    def search_models_by_keywords(self, query: str) -> List[ModelMetadata]:
        """Search models by keywords in query"""
        query_lower = query.lower()
        matching_models = []
        
        for model in self.models.values():
            if not model.is_active:
                continue
                
            # Check if any keyword matches the query
            for keyword in model.keywords:
                if keyword.lower() in query_lower:
                    matching_models.append(model)
                    break
        
        # Sort by accuracy (best first)
        return sorted(matching_models, key=lambda m: m.accuracy, reverse=True)
    
    def get_all_active_models(self) -> List[ModelMetadata]:
        """Get all active models"""
        return [model for model in self.models.values() if model.is_active]
    
    def deactivate_model(self, model_id: str) -> bool:
        """Deactivate a model"""
        if model_id in self.models:
            self.models[model_id].is_active = False
            self.models[model_id].last_updated = datetime.now()
            return True
        return False
    
    def update_model_performance(self, model_id: str, accuracy: float, response_time_ms: int):
        """Update model performance metrics"""
        if model_id in self.models:
            self.models[model_id].accuracy = accuracy
            self.models[model_id].response_time_ms = response_time_ms
            self.models[model_id].last_updated = datetime.now()
    
    def export_registry(self) -> Dict[str, Any]:
        """Export registry to dictionary"""
        return {
            model_id: {
                "model_id": model.model_id,
                "name": model.name,
                "model_type": model.model_type.value,
                "input_type": model.input_type.value,
                "description": model.description,
                "version": model.version,
                "accuracy": model.accuracy,
                "response_time_ms": model.response_time_ms,
                "endpoint": model.endpoint,
                "keywords": model.keywords,
                "input_schema": model.input_schema,
                "output_schema": model.output_schema,
                "is_active": model.is_active,
                "created_at": model.created_at.isoformat() if model.created_at else None,
                "last_updated": model.last_updated.isoformat() if model.last_updated else None
            }
            for model_id, model in self.models.items()
        }

# Global registry instance
model_registry = ModelRegistry()
