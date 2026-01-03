import os
import sys
import json
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
import hashlib

# Add parent directory to path if needed
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(os.path.dirname(current_dir))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Import services directly (not via HTTP)
from smart_agri_models.services import crop_service, disease_service

# OpenRouter API configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "meta-llama/llama-3.1-8b-instruct")

# Conversation storage (in-memory, can be moved to DB later)
conversations: Dict[str, Dict] = {}

# Cache for frequent questions
cache: Dict[str, Dict] = {}
CACHE_TTL = 3600  # 1 hour in seconds


def get_system_prompt() -> str:
    return """You are an expert agricultural assistant for the Smart Agriculture System (نظام الزراعة الذكية). You are a professional farming consultant with deep knowledge of agriculture, crop management, plant diseases, soil science, and farming best practices.

You help farmers in both Arabic and English with:

1. Crop recommendations based on soil and weather conditions (توصيات المحاصيل)
2. Plant disease identification and treatment (تشخيص وعلاج أمراض النباتات)
3. Weather analysis and forecasting (تحليل الطقس والتنبؤ)
4. Soil health assessment and improvement (تقييم وتحسين صحة التربة)
5. Best farming practices and techniques (أفضل الممارسات والتقنيات الزراعية)
6. General farming advice and questions (نصائح زراعية عامة)

CRITICAL INSTRUCTIONS - READ CAREFULLY:

**NEVER use tools for these - ALWAYS answer directly:**
- Greetings: "hi", "hello", "hey", "مرحبا", "السلام عليكم", "اهلا", "اهلا بيك" - Respond warmly and naturally
- Casual conversation: "how are you?", "who are you", "thanks", "شكراً", "ممكن ترد عربي"
- General knowledge questions: "What is organic farming?", "How to grow tomatoes?", "what do you know about healthy tomatoes", "ما هي أفضل طريقة لري النباتات؟"
- Questions about yourself: "who are you", "what can you do", "ايه المميزات اللي عندك"
- Questions about capabilities: Answer directly, don't call tools
- ANY question that doesn't require analyzing specific data

**ONLY use tools when:**
1. Crop Recommendation: User provides specific numeric values for soil/weather parameters (like "temp=40", "nitrogen=50", etc.)
2. Disease Detection: User uploads an image (requires image URL or base64)

**Response Rules:**
- ALWAYS respond in the SAME LANGUAGE as the user (Arabic or English, Egyptian dialect if requested)
- For greetings: "Hello! I'm your AI agricultural assistant. I can help with crop recommendations, disease detection, and farming advice. How can I help you today?" (in user's language)
- For general questions: Answer directly from your knowledge - DO NOT use tools
- For tool results (if tools were used): Explain results naturally in user's language
- Remember previous messages in the conversation
- Be conversational, helpful, and professional

IMPORTANT: If the user asks a general question, answer it directly. DO NOT try to use tools. Tools are ONLY for specific data analysis tasks."""


# Available tools for the LLM
AVAILABLE_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_crop_recommendation",
            "description": "Get crop recommendations based on soil and weather conditions. Use this when users provide specific numeric values for soil/weather parameters (even partial data like just temperature). All parameters are optional - defaults will be used for missing values.",
            "parameters": {
                "type": "object",
                "properties": {
                    "nitrogen": {
                        "type": "number",
                        "description": "Nitrogen content in soil (N) - typically between 0-140"
                    },
                    "phosphorus": {
                        "type": "number",
                        "description": "Phosphorus content in soil (P) - typically between 5-145"
                    },
                    "potassium": {
                        "type": "number",
                        "description": "Potassium content in soil (K) - typically between 5-205"
                    },
                    "temperature": {
                        "type": "number",
                        "description": "Average temperature in Celsius - typically between 8-44"
                    },
                    "humidity": {
                        "type": "number",
                        "description": "Humidity percentage - typically between 14-100"
                    },
                    "ph": {
                        "type": "number",
                        "description": "Soil pH level - typically between 3.5-10"
                    },
                    "rainfall": {
                        "type": "number",
                        "description": "Rainfall in mm - typically between 20-300"
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "detect_plant_disease",
            "description": "Detect plant diseases from uploaded images. Use this when users upload/provide an image URL or base64 encoded image for disease identification.",
            "parameters": {
                "type": "object",
                "properties": {
                    "imageUrl": {
                        "type": "string",
                        "description": "URL or base64 encoded image of the plant"
                    },
                    "cropType": {
                        "type": "string",
                        "description": "Optional: Crop type if known"
                    }
                },
                "required": ["imageUrl"]
            }
        }
    }
]


def get_conversation(conversation_id: str) -> Dict:
    """Get or create a conversation"""
    if conversation_id not in conversations:
        conversations[conversation_id] = {
            "id": conversation_id,
            "messages": [
                {
                    "role": "system",
                    "content": get_system_prompt()
                }
            ],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    return conversations[conversation_id]


def add_message(conversation_id: str, role: str, content: str):
    """Add a message to the conversation"""
    conversation = get_conversation(conversation_id)
    conversation["messages"].append({
        "role": role,
        "content": content
    })
    conversation["updated_at"] = datetime.now().isoformat()


def generate_cache_key(message: str) -> str:
    """Generate cache key from message"""
    normalized = message.lower().strip().replace(" ", "")
    return hashlib.md5(normalized.encode()).hexdigest()


def get_cached_response(user_message: str) -> Optional[Dict]:
    """Check cache for frequent questions"""
    # Skip cache for greetings and short messages
    normalized = user_message.lower().strip()
    greetings = ['hi', 'hello', 'hey', 'مرحبا', 'السلام عليكم', 'اهلا', 'اهلا بيك']
    if len(user_message) < 10 or normalized in greetings:
        return None
    
    cache_key = generate_cache_key(user_message)
    if cache_key in cache:
        cached = cache[cache_key]
        # Check if cache is still valid (simple check, can use timestamp)
        return cached
    return None


def set_cached_response(user_message: str, response: str, metadata: Optional[Dict] = None):
    """Store response in cache"""
    cache_key = generate_cache_key(user_message)
    cache[cache_key] = {
        "response": response,
        "metadata": metadata,
        "timestamp": datetime.now().isoformat()
    }
    # Limit cache size
    if len(cache) > 100:
        # Remove oldest entry (simple FIFO)
        oldest_key = next(iter(cache))
        del cache[oldest_key]


def execute_crop_recommendation(args: Dict) -> Dict:
    """Execute crop recommendation tool - calls crop_service directly"""
    try:
        # Extract parameters with defaults
        features = {
            "N": float(args.get("nitrogen", 50)),
            "P": float(args.get("phosphorus", 50)),
            "K": float(args.get("potassium", 50)),
            "temperature": float(args.get("temperature", 25)),
            "humidity": float(args.get("humidity", 60)),
            "ph": float(args.get("ph", 6.5)),
            "rainfall": float(args.get("rainfall", 100))
        }
        
        # Call crop_service directly (not via HTTP)
        result = crop_service.recommend(features)
        
        return {
            "recommendedCrop": result.get("crop", "unknown"),
            "confidence": 0.95,
            "reasoning": f"Based on your soil conditions (N: {features['N']}, P: {features['P']}, K: {features['K']}, pH: {features['ph']}) and weather ({features['temperature']}°C, {features['humidity']}% humidity, {features['rainfall']}mm rainfall), {result.get('crop')} is the optimal choice.",
            "source": "local_model"
        }
    except Exception as e:
        return {"error": f"Failed to get crop recommendation: {str(e)}"}


def execute_disease_detection(args: Dict) -> Dict:
    """Execute disease detection tool - calls disease_service directly"""
    try:
        image_url = args.get("imageUrl")
        if not image_url:
            return {"error": "Image URL is required for disease detection"}
        
        # For now, return error as we need image bytes, not URL
        # In a real implementation, you'd need to handle image uploads
        # This would require modifying the API to accept image data
        return {
            "error": "Disease detection requires image upload. Please upload an image file through the API.",
            "hint": "Use the /disease/analyze endpoint with image file upload"
        }
    except Exception as e:
        return {"error": f"Failed to detect disease: {str(e)}"}


def execute_tool(tool_name: str, args: Dict) -> Dict:
    """Execute a tool by name"""
    if tool_name == "get_crop_recommendation":
        return execute_crop_recommendation(args)
    elif tool_name == "detect_plant_disease":
        return execute_disease_detection(args)
    else:
        return {"error": f"Unknown tool: {tool_name}"}


def process_message(conversation_id: str, user_message: str) -> Dict:
    """Process a user message and generate a response"""
    # Add user message to conversation
    add_message(conversation_id, "user", user_message)
    
    conversation = get_conversation(conversation_id)
    
    # Check cache
    cached = get_cached_response(user_message)
    if cached:
        response_content = cached["response"]
        add_message(conversation_id, "assistant", response_content)
        return {
            "content": response_content,
            "metadata": cached.get("metadata")
        }
    
    if not OPENROUTER_API_KEY:
        return {
            "content": "LLM service is not configured. Please set OPENROUTER_API_KEY environment variable.",
            "error": "API key not configured"
        }
    
    # Format messages for LLM (exclude system message from format, add it separately)
    messages_for_llm = []
    for msg in conversation["messages"]:
        if msg["role"] != "system":
            messages_for_llm.append({
                "role": msg["role"],
                "content": msg["content"]
            })
    
    # Add system message as first message
    system_msg = {
        "role": "system",
        "content": get_system_prompt()
    }
    
    # Call OpenRouter API
    try:
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
                "X-Title": "SmartAgriSys"
            },
            json={
                "model": LLM_MODEL,
                "messages": [system_msg] + messages_for_llm,
                "tools": AVAILABLE_TOOLS,
                "tool_choice": "auto",
                "temperature": 0.7,
                "max_tokens": 2000
            },
            timeout=30
        )
        
        if not response.ok:
            error_text = response.text
            return {
                "content": f"I apologize, but I'm having trouble processing your request. Error: {response.status_code}",
                "error": error_text
            }
        
        data = response.json()
        choice = data["choices"][0]
        message = choice["message"]
        
        # Check if model returned tool calls
        if "tool_calls" in message and message["tool_calls"]:
            # Execute tools
            tool_results = []
            for tool_call in message["tool_calls"]:
                func_name = tool_call["function"]["name"]
                func_args = json.loads(tool_call["function"]["arguments"])
                result = execute_tool(func_name, func_args)
                tool_results.append({
                    "tool_call_id": tool_call["id"],
                    "role": "tool",
                    "name": func_name,
                    "content": json.dumps(result)
                })
            
            # Generate final response with tool results
            # Add assistant message with tool_calls
            messages_with_tools = [system_msg] + messages_for_llm + [
                {
                    "role": "assistant",
                    "content": message.get("content"),
                    "tool_calls": [
                        {
                            "id": tc["id"],
                            "type": "function",
                            "function": {
                                "name": tc["function"]["name"],
                                "arguments": tc["function"]["arguments"]
                            }
                        }
                        for tc in message["tool_calls"]
                    ]
                }
            ] + tool_results
            
            # Call LLM again with tool results
            final_response = requests.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
                    "X-Title": "SmartAgriSys"
                },
                json={
                    "model": LLM_MODEL,
                    "messages": messages_with_tools,
                    "temperature": 0.7,
                    "max_tokens": 2000
                },
                timeout=30
            )
            
            if final_response.ok:
                final_data = final_response.json()
                final_choice = final_data["choices"][0]
                response_content = final_choice["message"]["content"]
            else:
                # Fallback: summarize tool results
                first_result = tool_results[0]["content"] if tool_results else ""
                response_content = f"I've analyzed your request. Results: {first_result}"
        else:
            # No tool calls - direct response
            response_content = message.get("content", "")
            
            # Check if content contains raw JSON tool call (model incorrectly formatted it)
            if response_content.strip().startswith('{') and '"name"' in response_content and '"parameters"' in response_content:
                response_content = "I understand you're asking about agricultural data. Could you please provide more specific details or rephrase your question?"
        
        if not response_content:
            response_content = "I'm here to help with your agricultural questions. How can I assist you?"
        
        # Add assistant response to conversation
        add_message(conversation_id, "assistant", response_content)
        
        # Cache the response
        set_cached_response(user_message, response_content)
        
        return {
            "content": response_content
        }
        
    except requests.exceptions.RequestException as e:
        return {
            "content": "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
            "error": str(e)
        }
    except Exception as e:
        return {
            "content": "I apologize, but an error occurred. Please try again.",
            "error": str(e)
        }

