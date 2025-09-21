"""
Chatbot Integration - Interface between chatbot and MCB system
"""
import asyncio
import json
import logging
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
import aiohttp

from .mcb_api import ChatQuery
from .decision_engine import UserContext
from .model_registry import model_registry

logger = logging.getLogger(__name__)

class ChatbotMCBInterface:
    """Interface between chatbot and MCB system"""
    
    def __init__(self, mcb_base_url: str = "http://localhost:8001"):
        self.mcb_base_url = mcb_base_url
        self.session_cache = {}  # Cache for user sessions
        self.conversation_history = {}  # Store conversation context
    
    async def process_user_message(self, 
                                 message: str, 
                                 user_id: str,
                                 user_type: str = "farmer",
                                 session_id: Optional[str] = None,
                                 image_data: Optional[bytes] = None,
                                 user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process user message and return appropriate response
        """
        try:
            # Update conversation history
            self._update_conversation_history(user_id, message)
            
            # Determine if this is a model execution request or just analysis
            if self._is_execution_request(message):
                return await self._handle_execution_request(message, user_id, session_id, image_data)
            else:
                return await self._handle_analysis_request(message, user_id, user_type, session_id, image_data, user_context)
                
        except Exception as e:
            logger.error(f"Error processing user message: {str(e)}")
            return self._create_error_response(str(e))
    
    async def _handle_analysis_request(self, 
                                     message: str, 
                                     user_id: str,
                                     user_type: str,
                                     session_id: Optional[str],
                                     image_data: Optional[bytes],
                                     user_context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Handle model analysis and selection"""
        
        async with aiohttp.ClientSession() as session:
            try:
                if image_data:
                    # Send request with image
                    data = aiohttp.FormData()
                    data.add_field('message', message)
                    data.add_field('user_id', user_id)
                    data.add_field('user_type', user_type)
                    if session_id:
                        data.add_field('session_id', session_id)
                    if user_context and user_context.get('location'):
                        data.add_field('location', user_context['location'])
                    
                    data.add_field('file', image_data, filename='image.jpg', content_type='image/jpeg')
                    
                    url = f"{self.mcb_base_url}/mcb/analyze-with-image"
                    async with session.post(url, data=data) as response:
                        if response.status == 200:
                            mcb_response = await response.json()
                            return self._create_analysis_response(mcb_response, message)
                        else:
                            error_text = await response.text()
                            return self._create_error_response(f"MCB analysis failed: {error_text}")
                
                else:
                    # Send text-only request
                    payload = {
                        "message": message,
                        "user_id": user_id,
                        "user_type": user_type,
                        "session_id": session_id
                    }
                    
                    if user_context:
                        payload.update({
                            "location": user_context.get('location'),
                            "crop_types": user_context.get('crop_types'),
                            "farm_size": user_context.get('farm_size')
                        })
                    
                    url = f"{self.mcb_base_url}/mcb/analyze"
                    async with session.post(url, json=payload) as response:
                        if response.status == 200:
                            mcb_response = await response.json()
                            return self._create_analysis_response(mcb_response, message)
                        else:
                            error_text = await response.text()
                            return self._create_error_response(f"MCB analysis failed: {error_text}")
                            
            except Exception as e:
                logger.error(f"Error in analysis request: {str(e)}")
                return self._create_error_response(f"Analysis request failed: {str(e)}")
    
    async def _handle_execution_request(self, 
                                      message: str, 
                                      user_id: str,
                                      session_id: Optional[str],
                                      image_data: Optional[bytes]) -> Dict[str, Any]:
        """Handle model execution request"""
        
        # Extract execution parameters from message
        execution_params = self._extract_execution_params(message, image_data)
        
        if not execution_params:
            return self._create_error_response("Could not extract execution parameters from message")
        
        async with aiohttp.ClientSession() as session:
            try:
                payload = {
                    "model_id": execution_params["model_id"],
                    "session_id": session_id or f"exec_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    "inputs": execution_params["inputs"]
                }
                
                url = f"{self.mcb_base_url}/mcb/execute"
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        execution_result = await response.json()
                        return self._create_execution_response(execution_result)
                    else:
                        error_text = await response.text()
                        return self._create_error_response(f"Model execution failed: {error_text}")
                        
            except Exception as e:
                logger.error(f"Error in execution request: {str(e)}")
                return self._create_error_response(f"Execution request failed: {str(e)}")
    
    def _create_analysis_response(self, mcb_response: Dict[str, Any], original_message: str) -> Dict[str, Any]:
        """Create chatbot response from MCB analysis"""
        
        selected_model = mcb_response["selected_model"]
        confidence = mcb_response["confidence"]
        reasoning = mcb_response["reasoning"]
        required_inputs = mcb_response["required_inputs"]
        
        # Generate conversational response
        response_text = f"I understand you're asking about: '{original_message}'\n\n"
        response_text += f"{reasoning}\n\n"
        
        if required_inputs:
            response_text += "To proceed with the analysis, I need:\n"
            for input_name, input_info in required_inputs.items():
                if input_info["type"] == "file":
                    response_text += f"• {input_info['description']}\n"
                elif input_info["type"] == "form":
                    response_text += f"• {input_info['description']}\n"
                    for field, desc in input_info.get("fields", {}).items():
                        response_text += f"  - {desc}\n"
            
            response_text += "\nPlease provide the required information and I'll run the analysis for you!"
        else:
            response_text += "I have all the information needed. Would you like me to proceed with the analysis?"
        
        return {
            "type": "analysis",
            "response_text": response_text,
            "selected_model": selected_model,
            "confidence": confidence,
            "session_id": mcb_response["session_id"],
            "required_inputs": required_inputs,
            "can_execute": len(required_inputs) == 0,
            "alternatives": mcb_response.get("alternative_models", [])
        }
    
    def _create_execution_response(self, execution_result: Dict[str, Any]) -> Dict[str, Any]:
        """Create chatbot response from model execution result"""
        
        result = execution_result["result"]
        model_used = execution_result["model_used"]
        execution_time = execution_result["execution_time_ms"]
        
        # Generate conversational response based on result type
        if "disease" in result:
            # Disease detection result
            disease = result["disease"]
            confidence = result.get("confidence", 0)
            treatments = result.get("treatment_recommendations", [])
            severity = result.get("severity", "UNKNOWN")
            
            response_text = f"🔍 **Analysis Complete using {model_used}**\n\n"
            response_text += f"**Disease Detected:** {disease.replace('_', ' ').title()}\n"
            response_text += f"**Confidence:** {confidence:.1%}\n"
            response_text += f"**Severity:** {severity}\n\n"
            
            if treatments:
                response_text += "**Recommended Treatments:**\n"
                for i, treatment in enumerate(treatments, 1):
                    response_text += f"{i}. {treatment}\n"
            
            response_text += f"\n*Analysis completed in {execution_time}ms*"
            
        elif "crop" in result:
            # Crop recommendation result
            crop = result["crop"]
            soil_recs = result.get("soil_recommendations", [])
            planting_tips = result.get("planting_recommendations", [])
            alternatives = result.get("alternative_crops", [])
            
            response_text = f"🌱 **Crop Recommendation using {model_used}**\n\n"
            response_text += f"**Recommended Crop:** {crop.title()}\n\n"
            
            if soil_recs:
                response_text += "**Soil Recommendations:**\n"
                for rec in soil_recs:
                    response_text += f"• {rec}\n"
                response_text += "\n"
            
            if planting_tips:
                response_text += "**Planting Tips:**\n"
                for tip in planting_tips:
                    response_text += f"• {tip}\n"
                response_text += "\n"
            
            if alternatives:
                response_text += f"**Alternative Crops:** {', '.join(alternatives)}\n\n"
            
            response_text += f"*Analysis completed in {execution_time}ms*"
            
        else:
            # Generic result
            response_text = f"✅ **Analysis Complete using {model_used}**\n\n"
            response_text += f"**Results:**\n{json.dumps(result, indent=2)}\n\n"
            response_text += f"*Analysis completed in {execution_time}ms*"
        
        return {
            "type": "execution",
            "response_text": response_text,
            "result": result,
            "model_used": model_used,
            "execution_time_ms": execution_time
        }
    
    def _create_error_response(self, error_message: str) -> Dict[str, Any]:
        """Create error response"""
        return {
            "type": "error",
            "response_text": f"❌ I encountered an error: {error_message}\n\nPlease try again or rephrase your question.",
            "error": error_message
        }
    
    def _is_execution_request(self, message: str) -> bool:
        """Check if message is requesting model execution"""
        execution_keywords = [
            "run", "execute", "analyze", "process", "proceed", "go ahead",
            "yes, analyze", "start analysis", "do it", "continue"
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in execution_keywords)
    
    def _extract_execution_params(self, message: str, image_data: Optional[bytes]) -> Optional[Dict[str, Any]]:
        """Extract execution parameters from message"""
        # This is a simplified implementation
        # In a real scenario, you'd have more sophisticated parameter extraction
        
        if image_data and ("disease" in message.lower() or "plant" in message.lower()):
            return {
                "model_id": "disease_detection_v1",
                "inputs": {"image": image_data}
            }
        elif any(word in message.lower() for word in ["crop", "recommend", "plant", "soil"]):
            # Try to extract numerical values for crop recommendation
            import re
            numbers = re.findall(r'\d+(?:\.\d+)?', message)
            if len(numbers) >= 7:
                features = [float(n) for n in numbers[:7]]
                return {
                    "model_id": "crop_recommendation_v1",
                    "inputs": {"features": features}
                }
        
        return None
    
    def _update_conversation_history(self, user_id: str, message: str):
        """Update conversation history for context"""
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        self.conversation_history[user_id].append({
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 10 messages
        if len(self.conversation_history[user_id]) > 10:
            self.conversation_history[user_id] = self.conversation_history[user_id][-10:]
    
    def get_conversation_context(self, user_id: str) -> List[str]:
        """Get recent conversation context for user"""
        if user_id in self.conversation_history:
            return [item["message"] for item in self.conversation_history[user_id][-5:]]
        return []
    
    async def get_available_models(self) -> Dict[str, Any]:
        """Get list of available models"""
        async with aiohttp.ClientSession() as session:
            try:
                url = f"{self.mcb_base_url}/mcb/models"
                async with session.get(url) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {"models": [], "total_count": 0}
            except Exception as e:
                logger.error(f"Error getting available models: {str(e)}")
                return {"models": [], "total_count": 0}
    
    async def get_mcb_health(self) -> Dict[str, Any]:
        """Check MCB system health"""
        async with aiohttp.ClientSession() as session:
            try:
                url = f"{self.mcb_base_url}/mcb/health"
                async with session.get(url) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {"status": "unhealthy", "error": "MCB not responding"}
            except Exception as e:
                logger.error(f"Error checking MCB health: {str(e)}")
                return {"status": "unhealthy", "error": str(e)}

# Global chatbot interface instance
chatbot_mcb_interface = ChatbotMCBInterface()
