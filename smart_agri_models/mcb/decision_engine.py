"""
Decision Engine - Intelligent model selection based on user input and context
"""
import re
import json
import os
import requests
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

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
    model: Optional[ModelMetadata]
    confidence: float
    reasoning: str
    required_inputs: Dict[str, Any]
    alternative_models: List[ModelMetadata]
    is_general_help: bool = False

class CloudLLMSelector:
    """LLM-based model selector using cloud APIs - Vercel compatible"""
    
    def __init__(self, provider=None, api_key=None):
        self.provider = provider or os.getenv("LLM_PROVIDER", "groq")
        self.api_key = api_key or os.getenv(f"{self.provider.upper()}_API_KEY")
        self.enable_dynamic_extraction = os.getenv("MCB_DYNAMIC_EXTRACTION", "true").lower() == "true"
        self.available_models = {
            "crop_recommendation": {
                "id": "crop_recommendation_v1",
                "name": "Crop Recommendation System",
                "description": "Recommends optimal crops based on soil and weather conditions",
                "input_requirements": "Numerical data: N, P, K, temperature, humidity, pH, rainfall",
                "use_cases": ["crop selection", "planting advice", "soil analysis", "what to grow", "farming recommendations"],
                "keywords": ["crop", "plant", "grow", "soil", "fertilizer", "nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"]
            },
            "disease_detection": {
                "id": "disease_detection_v1", 
                "name": "Plant Disease Detection",
                "description": "Detects plant diseases from leaf images using computer vision",
                "input_requirements": "Image of plant leaves or affected plant parts",
                "use_cases": ["disease diagnosis", "plant health check", "leaf problems", "sick plants", "plant diseases"],
                "keywords": ["disease", "sick", "infection", "pest", "fungus", "bacteria", "spots", "blight", "rot", "yellowing", "wilting", "unhealthy"]
            },
            "general_help": {
                "id": "general_help_v1",
                "name": "General Agricultural Assistant",
                "description": "Provides general agricultural guidance and help",
                "input_requirements": "Any text query or greeting",
                "use_cases": ["greetings", "general questions", "help requests", "unclear queries", "introductions"],
                "keywords": ["hi", "hello", "help", "what can you do", "how are you", "good morning", "hey"]
            }
        }
    
    def call_llm(self, prompt: str) -> Dict[str, Any]:
        """Call cloud LLM API"""
        try:
            if self.provider == "openai":
                return self._call_openai(prompt)
            elif self.provider == "groq":
                return self._call_groq(prompt)
            else:
                return self._fallback_selection(prompt)
                
        except Exception as e:
            print(f"LLM error: {e}")
            return self._fallback_selection(prompt)
    
    def _call_openai(self, prompt: str) -> Dict[str, Any]:
        """Call OpenAI API"""
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 200,
                "temperature": 0.1
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            return json.loads(content)
        else:
            raise Exception(f"OpenAI API error: {response.status_code}")
    
    def _call_groq(self, prompt: str) -> Dict[str, Any]:
        """Call Groq API (free tier available)"""
        if not self.api_key:
            print("Warning: No Groq API key found, using fallback")
            return self._fallback_selection(prompt)
            
        try:
            # Enforce JSON-only output
            json_prompt = f"""{prompt}

CRITICAL: Respond with ONLY a valid JSON object. No markdown, no explanation, no extra text.
Start your response with {{ and end with }}. Nothing else."""

            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [{"role": "user", "content": json_prompt}],
                    "max_tokens": 300,  # Increased for complex responses
                    "temperature": 0.1
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content'].strip()
                
                # Try parsing directly
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    print(f"Warning: Invalid JSON from Groq API, attempting extraction...")
                    
                    # Try to extract JSON from mixed content
                    json_match = re.search(r'\{.*\}', content, re.DOTALL)
                    if json_match:
                        try:
                            extracted_json = json.loads(json_match.group())
                            print(f"✓ Successfully extracted JSON from response")
                            return extracted_json
                        except json.JSONDecodeError:
                            pass
                    
                    # NEW: Try parsing markdown response for features
                    parsed_result = self._parse_markdown_response(content)
                    if parsed_result:
                        return parsed_result
                    
                    # Log the problematic response
                    print(f"Could not parse LLM response: {content[:200]}...")
                    return self._fallback_selection(prompt)
            else:
                error_detail = ""
                try:
                    error_data = response.json()
                    error_detail = error_data.get('error', {}).get('message', 'Unknown error')
                except:
                    error_detail = response.text
                print(f"Groq API error {response.status_code}: {error_detail}")
                return self._fallback_selection(prompt)
                
        except requests.exceptions.RequestException as e:
            print(f"Groq API request failed: {e}")
            return self._fallback_selection(prompt)
    
    def extract_numerical_features(self, query: str) -> List[float]:
        """
        Extract numerical features from query text - always returns valid list.
        Uses standard agricultural defaults only for missing values.
        Format: [N, P, K, temperature, humidity, pH, rainfall]
        """
        import re
        
        # Standard agricultural defaults for missing values
        # These represent typical moderate conditions suitable for general crops
        DEFAULT_VALUES = {
            'N': 50,          # Nitrogen (kg/ha) - moderate
            'P': 40,          # Phosphorus (kg/ha) - moderate
            'K': 40,          # Potassium (kg/ha) - moderate
            'temp': 25,       # Temperature (°C) - moderate
            'humidity': 65,   # Humidity (%) - moderate
            'pH': 6.5,        # pH - neutral
            'rainfall': 100   # Rainfall (mm) - moderate
        }
        
        features = [0.0] * 7  # Initialize with zeros
        
        # Nitrogen (N) - flexible patterns
        nitrogen_match = re.search(r'(?:nitrogen|n)\s*[=:]\s*(\d+\.?\d*)', query.lower())
        features[0] = float(nitrogen_match.group(1)) if nitrogen_match else DEFAULT_VALUES['N']
        
        # Phosphorus (P) - handle both spellings
        phosphorus_match = re.search(r'(?:phosphorus|phosphorous|p)\s*[=:]\s*(\d+\.?\d*)', query.lower())
        features[1] = float(phosphorus_match.group(1)) if phosphorus_match else DEFAULT_VALUES['P']
        
        # Potassium (K)
        potassium_match = re.search(r'(?:potassium|k)\s*[=:]\s*(\d+\.?\d*)', query.lower())
        features[2] = float(potassium_match.group(1)) if potassium_match else DEFAULT_VALUES['K']
        
        # Temperature
        temp_match = re.search(r'(?:temperature|temp)\s*[=:]\s*(\d+\.?\d*)', query.lower())
        features[3] = float(temp_match.group(1)) if temp_match else DEFAULT_VALUES['temp']
        
        # Humidity
        humidity_match = re.search(r'(?:humidity|humid)\s*[=:]\s*(\d+\.?\d*)', query.lower())
        features[4] = float(humidity_match.group(1)) if humidity_match else DEFAULT_VALUES['humidity']
        
        # pH
        ph_match = re.search(r'(?:ph|ph\s*level)\s*[=:]\s*(\d+\.?\d*)', query.lower())
        features[5] = float(ph_match.group(1)) if ph_match else DEFAULT_VALUES['pH']
        
        # Rainfall
        rainfall_match = re.search(r'(?:rainfall|rain)\s*[=:]\s*(\d+\.?\d*)', query.lower())
        features[6] = float(rainfall_match.group(1)) if rainfall_match else DEFAULT_VALUES['rainfall']
        
        # Always return a valid list with no None values
        return features

    def _fallback_selection(self, prompt: str) -> Dict[str, Any]:
        """Fallback to simple keyword matching if LLM fails"""
        query = prompt.lower().strip()
        
        # Extract numerical features from query if present (always returns valid list)
        extracted_features = self.extract_numerical_features(query)
        
        # Disease detection keywords
        disease_keywords = ["disease", "sick", "infection", "pest", "spots", "blight", "rot", "yellowing", "wilting", "unhealthy", "problem", "wrong", "issue", "issues", "damaged", "dying", "brown", "black", "fungus", "bacteria", "virus", "leaf", "leaves", "diagnosis", "diagnose", "identify"]
        disease_score = sum(1 for keyword in disease_keywords if keyword in query)
        
        # Crop recommendation keywords  
        crop_keywords = ["crop", "plant", "grow", "soil", "fertilizer", "nitrogen", "phosphorus", "potassium", "recommend", "what should i plant", "which crop", "best crop", "farming", "agriculture", "harvest", "yield", "ph", "temperature", "k", "n", "p"]
        crop_score = sum(1 for keyword in crop_keywords if keyword in query)
        
        # CHANGED: Check for crop/disease keywords FIRST (higher priority than greetings)
        # If we have numerical features or crop keywords, use crop recommendation
        if extracted_features or crop_score > 0:
            return {
                "selected_model": "crop_recommendation",
                "confidence": 0.8 if extracted_features else 0.7,
                "reasoning": "Query contains crop-related data or keywords, using fallback selection",
                "extracted_data": {
                    "crop_features": extracted_features,  # Always valid list now
                    "user_intent": "crop recommendation based on soil conditions",
                    "data_source": "extracted_from_query" if extracted_features else "default_values"
                }
            }
        elif disease_score > 0:
            return {
                "selected_model": "disease_detection",
                "confidence": 0.8,
                "reasoning": "Query contains disease-related keywords, using fallback selection",
                "extracted_data": {}
            }
        
        # CHANGED: Only check for greetings if no crop/disease keywords found
        greeting_keywords = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "how are you", "what can you do"]
        if any(greeting in query for greeting in greeting_keywords) or len(query) <= 3:
            return {
                "selected_model": "general_help",
                "confidence": 0.9,
                "reasoning": "Query is a greeting or general inquiry, providing general help",
                "extracted_data": {}
            }
        else:
            # Default to general help for unclear queries
            return {
                "selected_model": "general_help",
                "confidence": 0.6,
                "reasoning": "Query unclear, providing general agricultural assistance",
                "extracted_data": {}
            }
    
    def analyze_and_select_model(self, user_query: str, has_image: bool = False, context: UserContext = None) -> Dict[str, Any]:
        """LLM analyzes prompt and selects model with extracted data"""
        
        context_info = ""
        if context:
            context_info = f"""
User Context:
- User Type: {context.user_type}
- Location: {context.location or 'Not specified'}
- Farm Size: {context.farm_size or 'Not specified'} acres
"""
        
        prompt = f"""You are an intelligent agricultural AI assistant. Analyze the user's query and determine:
1. What they want to achieve
2. Which AI model to use
3. What data to extract/prepare for the model

{context_info}

User Query: "{user_query}"

Available Models:
- crop_recommendation: Needs [N, P, K, temperature, humidity, pH, rainfall] - predicts best crop
- disease_detection: Needs plant image - identifies plant diseases  
- general_help: For greetings, general questions, unclear queries

TASK: Analyze the query and respond with:

{{
    "selected_model": "crop_recommendation" | "disease_detection" | "general_help",
    "confidence": 0.0-1.0,
    "reasoning": "Why this model was chosen",
    "extracted_data": {{
        "crop_features": [N, P, K, temp, humidity, pH, rainfall] // if crop_recommendation
        "mentioned_crops": ["rice", "wheat"] // if user mentioned specific crops
        "disease_symptoms": ["spots", "yellowing"] // if disease_detection
        "user_intent": "what the user really wants"
    }},
    "data_source": "extracted_from_query" | "default_values" | "user_provided",
    "needs_more_info": true/false,
    "suggested_questions": ["What additional info would help?"]
}}

ANALYSIS GUIDELINES:
- For crop questions: Extract any numerical values (N, P, K, etc.) or use reasonable defaults
- For disease questions: Look for symptoms, plant types, problems
- For greetings/unclear: Use general_help
- Always extract user intent and mentioned crops/plants

Be intelligent about extracting agricultural data from natural language!"""

        return self.call_llm(prompt)

    def select_model(self, user_query: str, has_image: bool = False, numerical_data: Dict = None, context: UserContext = None) -> Dict[str, Any]:
        """Legacy method - use analyze_and_select_model instead"""
        return self.analyze_and_select_model(user_query, has_image, context)
    
    def extract_entities_dynamically(self, text: str) -> Dict[str, Any]:
        """Use LLM to extract agricultural entities dynamically - Vercel compatible"""
        
        if not self.enable_dynamic_extraction or not self.api_key:
            return self._fallback_entity_extraction(text)
        
        try:
            prompt = f"""Extract agricultural information from this text: "{text}"

Instructions:
1. Identify any crops, plants, or agricultural products mentioned
2. Identify any diseases, pests, or plant health issues
3. Identify any nutrients, fertilizers, or soil conditions
4. Identify any numerical values with their units
5. Identify any locations or climate information

Respond ONLY with valid JSON in this format:
{{
    "crops": ["crop1", "crop2"],
    "diseases": ["disease1", "disease2"], 
    "nutrients": ["nitrogen", "phosphorus"],
    "numbers": [{{value: 25, unit: "kg", context: "nitrogen"}}],
    "locations": ["location1"],
    "climate_conditions": ["temperature", "humidity"],
    "confidence": 0.85
}}"""

            result = self.call_llm(prompt)
            return result if isinstance(result, dict) else self._fallback_entity_extraction(text)
            
        except Exception as e:
            print(f"Dynamic entity extraction failed: {e}")
            return self._fallback_entity_extraction(text)
    
    def _fallback_entity_extraction(self, text: str) -> Dict[str, Any]:
        """Fallback entity extraction using basic patterns"""
        entities = {
            "crops": [],
            "diseases": [],
            "nutrients": [],
            "numbers": [],
            "locations": [],
            "climate_conditions": [],
            "confidence": 0.6
        }
        
        # Basic pattern matching as fallback
        import re
        
        # Common crops (expandable list)
        crop_patterns = r'\b(rice|wheat|corn|maize|tomato|potato|apple|orange|banana|lettuce|carrot|soybean|cotton|barley|oats)\b'
        crops = re.findall(crop_patterns, text.lower())
        entities["crops"] = list(set(crops))
        
        # Common diseases
        disease_patterns = r'\b(blight|rust|mildew|rot|spot|wilt|mosaic|scab|canker|leaf spot|powdery mildew)\b'
        diseases = re.findall(disease_patterns, text.lower())
        entities["diseases"] = list(set(diseases))
        
        # Nutrients
        nutrient_patterns = r'\b(nitrogen|phosphorus|potassium|n|p|k|fertilizer|compost|manure)\b'
        nutrients = re.findall(nutrient_patterns, text.lower())
        entities["nutrients"] = list(set(nutrients))
        
        # Numbers with context
        number_patterns = r'(\d+(?:\.\d+)?)\s*(kg|grams?|cm|inches?|acres?|hectares?|celsius|fahrenheit|%|mm|degrees?)?'
        numbers = re.findall(number_patterns, text.lower())
        entities["numbers"] = [{"value": float(num), "unit": unit or "unknown"} for num, unit in numbers]
        
        return entities

    def _parse_markdown_response(self, content: str) -> Optional[Dict[str, Any]]:
        """Parse features from markdown-style LLM response"""
        try:
            # Extract crop_features from markdown patterns like:
            # * `crop_features`: [N=50, P=50, K=20, temperature=40, humidity= (not mentioned), pH=6.5, rainfall= (not mentioned)]
            
            # Look for crop_features array pattern
            features_match = re.search(r'crop_features.*?\[([^\]]+)\]', content, re.IGNORECASE | re.DOTALL)
            
            if features_match:
                features_str = features_match.group(1)
                print(f"Found features string: {features_str}")
                
                # Default values for all features [N, P, K, temp, humidity, pH, rainfall]
                features = [25, 20, 30, 26, 65, 6.7, 120]
                
                # Extract each parameter with flexible patterns
                n_match = re.search(r'(?:N|nitrogen)\s*[=:]\s*(\d+\.?\d*)', features_str, re.IGNORECASE)
                if n_match:
                    features[0] = float(n_match.group(1))
                    
                p_match = re.search(r'(?:P|phosphorus|phosphorous)\s*[=:]\s*(\d+\.?\d*)', features_str, re.IGNORECASE)
                if p_match:
                    features[1] = float(p_match.group(1))
                    
                k_match = re.search(r'(?:K|potassium)\s*[=:]\s*(\d+\.?\d*)', features_str, re.IGNORECASE)
                if k_match:
                    features[2] = float(k_match.group(1))
                    
                temp_match = re.search(r'(?:temperature|temp)\s*[=:]\s*(\d+\.?\d*)', features_str, re.IGNORECASE)
                if temp_match:
                    features[3] = float(temp_match.group(1))
                    
                humidity_match = re.search(r'(?:humidity|humid)\s*[=:]\s*(\d+\.?\d*)', features_str, re.IGNORECASE)
                if humidity_match:
                    features[4] = float(humidity_match.group(1))
                # else: keep default 65.0
                    
                ph_match = re.search(r'(?:pH|ph)\s*[=:]\s*(\d+\.?\d*)', features_str, re.IGNORECASE)
                if ph_match:
                    features[5] = float(ph_match.group(1))
                    
                rainfall_match = re.search(r'(?:rainfall|rain)\s*[=:]\s*(\d+\.?\d*)', features_str, re.IGNORECASE)
                if rainfall_match:
                    features[6] = float(rainfall_match.group(1))
                # else: keep default 120.0
                
                # Check if we got at least some values
                if any(f != 25 or f != 20 or f != 30 or f != 26 or f != 65 or f != 6.7 or f != 120 for f in features):
                    print(f"✓ Parsed features from markdown: {features}")
                    
                    # Look for model selection
                    model_match = re.search(r'selected_model.*?["\']?(crop_recommendation|disease_detection|general_help)["\']?', content, re.IGNORECASE)
                    selected_model = model_match.group(1) if model_match else "crop_recommendation"
                    
                    # Look for user intent
                    intent_match = re.search(r'user_intent.*?["\']([^"\']+)["\']', content, re.IGNORECASE)
                    user_intent = intent_match.group(1) if intent_match else "crop recommendation"
                    
                    return {
                        "selected_model": selected_model,
                        "confidence": 0.85,
                        "reasoning": "Parsed from LLM markdown response",
                        "extracted_data": {
                            "crop_features": features,
                            "user_intent": user_intent,
                            "data_source": "extracted_from_query"
                        }
                    }
            
            return None
        except Exception as e:
            print(f"Error parsing markdown response: {e}")
            return None

class DecisionEngine:
    """Intelligent model selection engine with LLM support"""
    
    def __init__(self, registry: ModelRegistry = None, use_llm: bool = None):
        self.registry = registry or model_registry
        self.use_llm = use_llm if use_llm is not None else os.getenv("MCB_USE_LLM", "true").lower() == "true"
        self.llm_selector = CloudLLMSelector() if self.use_llm else None
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
        
        if self.use_llm and self.llm_selector:
            return self._recommend_with_llm(analysis, context)
        else:
            return self._recommend_with_rules(analysis, context)
    
    def _recommend_with_llm(self, analysis: InputAnalysis, context: UserContext = None) -> ModelRecommendation:
        """Use LLM to recommend the best model"""
        
        # Extract numerical data if present
        numerical_data = None
        if 'numbers' in analysis.extracted_entities:
            numbers = analysis.extracted_entities['numbers']
            if len(numbers) >= 7:  # Enough for crop recommendation
                numerical_data = {
                    "values": numbers[:7],
                    "description": "Detected numerical values that could be N,P,K,temp,humidity,pH,rainfall"
                }
        
        # Use LLM to select model
        llm_result = self.llm_selector.select_model(
            user_query=analysis.raw_input,
            has_image=analysis.has_image,
            numerical_data=numerical_data,
            context=context
        )
        
        # Get the selected model from registry
        model_id = llm_result.get('selected_model')
        if model_id == 'crop_recommendation':
            model = self.registry.get_model('crop_recommendation_v1')
        elif model_id == 'disease_detection':
            model = self.registry.get_model('disease_detection_v1')
        elif model_id == 'general_help':
            # Return a special response for general help
            return ModelRecommendation(
                model=None,
                confidence=llm_result.get('confidence', 0.9),
                reasoning=llm_result.get('reasoning', 'General help requested'),
                required_inputs={},
                alternative_models=[],
                is_general_help=True
            )
        else:
            # Fallback to first available model
            model = self.registry.get_all_active_models()[0]
        
        if not model:
            raise ValueError(f"Model {model_id} not found in registry")
        
        # Determine required inputs
        required_inputs = self._determine_required_inputs(model, analysis)
        
        # Get alternative models
        all_models = self.registry.get_all_active_models()
        alternatives = [m for m in all_models if m.model_id != model.model_id][:2]
        
        return ModelRecommendation(
            model=model,
            confidence=llm_result.get('confidence', 0.8),
            reasoning=llm_result.get('reasoning', 'Selected by LLM'),
            required_inputs=required_inputs,
            alternative_models=alternatives
        )
    
    def _recommend_with_rules(self, analysis: InputAnalysis, context: UserContext = None) -> ModelRecommendation:
        """Fallback to rule-based recommendation"""
        
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

# Global decision engine instance with LLM support
decision_engine = DecisionEngine(use_llm=True)
