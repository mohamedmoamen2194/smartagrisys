"""
Decision Engine - Intelligent model selection based on user input and context
"""
import re
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json

from .model_registry import ModelRegistry, ModelMetadata, ModelType, InputType, model_registry

class IntentType(Enum):
    DISEASE_DIAGNOSIS = "disease_diagnosis"
    CROP_PLANNING = "crop_planning"
    FRUIT_QUALITY = "fruit_quality"
    SOIL_ANALYSIS = "soil_analysis"
    GENERAL_INQUIRY = "general_inquiry"

@dataclass
class UserContext:
    """User context information"""
    user_id: str
    user_type: str  # farmer, customer, admin
    location: Optional[str] = None
    crop_types: Optional[List[str]] = None
    farm_size: Optional[float] = None
    previous_queries: Optional[List[str]] = None
    session_id: Optional[str] = None

@dataclass
class InputAnalysis:
    """Analysis of user input"""
    raw_input: str
    intent: IntentType
    confidence: float
    extracted_entities: Dict[str, Any]
    has_image: bool
    has_numerical_data: bool
    keywords_found: List[str]

@dataclass
class ModelRecommendation:
    """Model recommendation with reasoning"""
    model: ModelMetadata
    confidence: float
    reasoning: str
    required_inputs: Dict[str, Any]
    alternative_models: List[ModelMetadata]

class DecisionEngine:
    """Intelligent model selection engine"""
    
    def __init__(self, registry: ModelRegistry = None):
        self.registry = registry or model_registry
        self.intent_patterns = self._initialize_intent_patterns()
        self.entity_extractors = self._initialize_entity_extractors()
    
    def _initialize_intent_patterns(self) -> Dict[IntentType, List[str]]:
        """Initialize regex patterns for intent detection"""
        return {
            IntentType.DISEASE_DIAGNOSIS: [
                r'\b(disease|sick|infection|pest|fungus|bacteria|virus)\b',
                r'\b(blight|spot|rot|yellowing|wilting|damaged|unhealthy)\b',
                r'\b(what.*wrong|diagnose|identify.*disease|plant.*problem)\b',
                r'\b(leaf.*spots|brown.*leaves|dying.*plants)\b'
            ],
            IntentType.CROP_PLANNING: [
                r'\b(crop|plant|grow|recommend|suggestion|best.*crop)\b',
                r'\b(soil.*condition|weather|climate|season)\b',
                r'\b(nitrogen|phosphorus|potassium|fertilizer|ph)\b',
                r'\b(what.*plant|which.*crop|suitable.*crop)\b'
            ],
            IntentType.FRUIT_QUALITY: [
                r'\b(fruit.*size|quality|grade|harvest.*ready)\b',
                r'\b(ripe|mature|defect|color|diameter|weight)\b',
                r'\b(when.*harvest|ready.*pick)\b'
            ],
            IntentType.SOIL_ANALYSIS: [
                r'\b(soil.*test|soil.*analysis|ph.*level)\b',
                r'\b(nutrient|mineral|fertility|soil.*health)\b'
            ]
        }
    
    def _initialize_entity_extractors(self) -> Dict[str, str]:
        """Initialize entity extraction patterns"""
        return {
            'crop_names': r'\b(rice|wheat|corn|tomato|potato|apple|orange|banana|lettuce|carrot)\b',
            'nutrients': r'\b(nitrogen|phosphorus|potassium|n|p|k)\b',
            'diseases': r'\b(blight|rust|mildew|rot|spot|wilt|mosaic)\b',
            'numbers': r'\b\d+(?:\.\d+)?\b',
            'units': r'\b(kg|grams|cm|inches|acres|hectares|celsius|fahrenheit|%)\b'
        }
    
    def analyze_input(self, user_input: str, context: UserContext = None, 
                     has_image: bool = False, numerical_data: Dict = None) -> InputAnalysis:
        """Analyze user input to determine intent and extract entities"""
        
        # Detect intent
        intent, intent_confidence = self._detect_intent(user_input)
        
        # Extract entities
        entities = self._extract_entities(user_input)
        
        # Find matching keywords
        keywords_found = []
        for model in self.registry.get_all_active_models():
            for keyword in model.keywords:
                if keyword.lower() in user_input.lower():
                    keywords_found.append(keyword)
        
        return InputAnalysis(
            raw_input=user_input,
            intent=intent,
            confidence=intent_confidence,
            extracted_entities=entities,
            has_image=has_image,
            has_numerical_data=numerical_data is not None,
            keywords_found=list(set(keywords_found))
        )
    
    def _detect_intent(self, text: str) -> Tuple[IntentType, float]:
        """Detect user intent from text"""
        text_lower = text.lower()
        intent_scores = {}
        
        for intent, patterns in self.intent_patterns.items():
            score = 0
            for pattern in patterns:
                matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
                score += matches
            intent_scores[intent] = score
        
        if not any(intent_scores.values()):
            return IntentType.GENERAL_INQUIRY, 0.5
        
        best_intent = max(intent_scores, key=intent_scores.get)
        max_score = intent_scores[best_intent]
        confidence = min(max_score / len(self.intent_patterns[best_intent]), 1.0)
        
        return best_intent, confidence
    
    def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract entities from text"""
        entities = {}
        
        for entity_type, pattern in self.entity_extractors.items():
            matches = re.findall(pattern, text.lower(), re.IGNORECASE)
            if matches:
                entities[entity_type] = list(set(matches))
        
        return entities
    
    def recommend_model(self, analysis: InputAnalysis, context: UserContext = None) -> ModelRecommendation:
        """Recommend the best model based on input analysis"""
        
        # Get candidate models based on intent
        candidates = self._get_candidate_models(analysis)
        
        if not candidates:
            # Fallback: search by keywords
            candidates = self.registry.search_models_by_keywords(analysis.raw_input)
        
        if not candidates:
            raise ValueError("No suitable models found for the given input")
        
        # Score and rank candidates
        scored_candidates = []
        for model in candidates:
            score = self._score_model(model, analysis, context)
            scored_candidates.append((model, score))
        
        # Sort by score (highest first)
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        
        best_model, best_score = scored_candidates[0]
        alternatives = [model for model, _ in scored_candidates[1:3]]  # Top 2 alternatives
        
        # Generate reasoning
        reasoning = self._generate_reasoning(best_model, analysis, best_score)
        
        # Determine required inputs
        required_inputs = self._determine_required_inputs(best_model, analysis)
        
        return ModelRecommendation(
            model=best_model,
            confidence=best_score,
            reasoning=reasoning,
            required_inputs=required_inputs,
            alternative_models=alternatives
        )
    
    def _get_candidate_models(self, analysis: InputAnalysis) -> List[ModelMetadata]:
        """Get candidate models based on intent"""
        intent_to_model_type = {
            IntentType.DISEASE_DIAGNOSIS: ModelType.DISEASE_DETECTION,
            IntentType.CROP_PLANNING: ModelType.CROP_RECOMMENDATION,
            IntentType.FRUIT_QUALITY: ModelType.FRUIT_SIZING,
            IntentType.SOIL_ANALYSIS: ModelType.SOIL_ANALYSIS
        }
        
        if analysis.intent in intent_to_model_type:
            model_type = intent_to_model_type[analysis.intent]
            return self.registry.get_models_by_type(model_type)
        
        return []
    
    def _score_model(self, model: ModelMetadata, analysis: InputAnalysis, context: UserContext = None) -> float:
        """Score a model based on how well it matches the input"""
        score = 0.0
        
        # Base score from model accuracy
        score += model.accuracy * 0.3
        
        # Intent matching
        if self._intent_matches_model(analysis.intent, model.model_type):
            score += 0.4
        
        # Input type compatibility
        if self._input_type_compatible(analysis, model):
            score += 0.2
        else:
            score -= 0.3  # Penalty for incompatible input
        
        # Special boost for disease detection when image is available
        if (analysis.has_image and 
            model.model_type.value == "disease_detection" and
            any(keyword in analysis.raw_input.lower() for keyword in 
                ['plant', 'disease', 'sick', 'wrong', 'problem', 'leaf', 'leaves'])):
            score += 0.3  # Strong boost for disease detection with images
        
        # Keyword matching
        keyword_matches = len([k for k in analysis.keywords_found if k in model.keywords])
        if model.keywords:
            keyword_score = keyword_matches / len(model.keywords)
            score += keyword_score * 0.1
        
        # Performance bonus (faster models get slight preference)
        if model.response_time_ms < 1000:
            score += 0.05
        
        # Context-based adjustments
        if context:
            score += self._apply_context_adjustments(model, context)
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _intent_matches_model(self, intent: IntentType, model_type: ModelType) -> bool:
        """Check if intent matches model type"""
        mappings = {
            IntentType.DISEASE_DIAGNOSIS: ModelType.DISEASE_DETECTION,
            IntentType.CROP_PLANNING: ModelType.CROP_RECOMMENDATION,
            IntentType.FRUIT_QUALITY: ModelType.FRUIT_SIZING,
            IntentType.SOIL_ANALYSIS: ModelType.SOIL_ANALYSIS
        }
        return mappings.get(intent) == model_type
    
    def _input_type_compatible(self, analysis: InputAnalysis, model: ModelMetadata) -> bool:
        """Check if input type is compatible with model"""
        if model.input_type == InputType.IMAGE:
            # For disease detection, allow text queries but mark as requiring image
            if model.model_type.value == "disease_detection":
                return True  # Allow text queries, will request image later
            return analysis.has_image
        elif model.input_type == InputType.NUMERICAL:
            return analysis.has_numerical_data or 'numbers' in analysis.extracted_entities
        elif model.input_type == InputType.TEXT:
            return True  # Text is always available
        return False
    
    def _apply_context_adjustments(self, model: ModelMetadata, context: UserContext) -> float:
        """Apply context-based score adjustments"""
        adjustment = 0.0
        
        # User type preferences
        if context.user_type == "farmer" and model.model_type in [ModelType.DISEASE_DETECTION, ModelType.CROP_RECOMMENDATION]:
            adjustment += 0.05
        elif context.user_type == "customer" and model.model_type == ModelType.FRUIT_SIZING:
            adjustment += 0.05
        
        # Previous query history
        if context.previous_queries:
            # Boost models used recently
            for query in context.previous_queries[-3:]:  # Last 3 queries
                if any(keyword in query.lower() for keyword in model.keywords):
                    adjustment += 0.02
        
        return adjustment
    
    def _generate_reasoning(self, model: ModelMetadata, analysis: InputAnalysis, score: float) -> str:
        """Generate human-readable reasoning for model selection"""
        reasons = []
        
        # Intent matching
        if self._intent_matches_model(analysis.intent, model.model_type):
            reasons.append(f"matches your {analysis.intent.value.replace('_', ' ')} intent")
        
        # Input compatibility
        if model.input_type == InputType.IMAGE and analysis.has_image:
            reasons.append("can process the uploaded image")
        elif model.input_type == InputType.NUMERICAL and analysis.has_numerical_data:
            reasons.append("can analyze the numerical data provided")
        
        # Performance
        if model.accuracy > 0.9:
            reasons.append(f"has high accuracy ({model.accuracy:.1%})")
        
        # Keywords
        if analysis.keywords_found:
            matching_keywords = [k for k in analysis.keywords_found if k in model.keywords]
            if matching_keywords:
                reasons.append(f"matches keywords: {', '.join(matching_keywords[:3])}")
        
        if not reasons:
            reasons.append("is the best available model for this type of query")
        
        return f"Selected {model.name} because it " + " and ".join(reasons) + f" (confidence: {score:.1%})"
    
    def _determine_required_inputs(self, model: ModelMetadata, analysis: InputAnalysis) -> Dict[str, Any]:
        """Determine what inputs are still needed for the model"""
        required = {}
        
        if model.input_type == InputType.IMAGE and not analysis.has_image:
            if model.model_type == ModelType.DISEASE_DETECTION:
                required["image"] = {
                    "type": "file",
                    "description": "Please upload a clear image of the affected plant/leaves for accurate disease diagnosis",
                    "formats": model.input_schema.get("fields", {}).get("file", {}).get("formats", ["jpg", "png", "jpeg"]),
                    "guidance": "Take a close-up photo of the affected leaves or plant parts in good lighting"
                }
            else:
                required["image"] = {
                    "type": "file",
                    "description": "Please upload an image of the plant/crop",
                    "formats": model.input_schema.get("fields", {}).get("file", {}).get("formats", ["jpg", "png"])
                }
        
        if model.input_type == InputType.NUMERICAL and not analysis.has_numerical_data:
            if model.model_type == ModelType.CROP_RECOMMENDATION:
                required["soil_data"] = {
                    "type": "form",
                    "description": "Please provide soil and weather information",
                    "fields": {
                        "nitrogen": "Nitrogen content (N)",
                        "phosphorus": "Phosphorus content (P)", 
                        "potassium": "Potassium content (K)",
                        "temperature": "Temperature (°C)",
                        "humidity": "Humidity (%)",
                        "ph": "Soil pH level",
                        "rainfall": "Rainfall (mm)"
                    }
                }
        
        return required

# Global decision engine instance
decision_engine = DecisionEngine()
