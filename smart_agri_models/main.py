import os
import sys
from typing import Optional, Dict, Any
from datetime import datetime

# Add parent directory to path if running from smart_agri_models directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from smart_agri_models.services import disease_service, crop_service, size_service, llm_service
from smart_agri_models.services import llm_orchestrator


class CropRequest(BaseModel):
    features: Dict[str, Any]


class OrchestrateRequest(BaseModel):
    message: str


class ChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None


app = FastAPI(title="SmartAgri Models API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/disease/analyze")
async def disease_analyze(image: UploadFile = File(...)):
    if not image:
        raise HTTPException(status_code=400, detail="Image file is required")
    try:
        data = await image.read()
        result = disease_service.analyze_image(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease analysis failed: {e}")


@app.post("/crop/recommend")
def crop_recommend(req: CropRequest):
    try:
        return crop_service.recommend(req.features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation failed: {e}")


@app.post("/size/estimate")
def size_estimate(payload: Dict[str, Any]):
    try:
        return size_service.estimate(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Size estimation failed: {e}")


@app.post("/orchestrate")
def orchestrate(req: OrchestrateRequest):
    try:
        decision = llm_service.route_intent(req.message)
        tool = decision.get("tool", "crop")
        args = decision.get("args", {})

        if tool == "disease":
            return {
                "tool": "disease",
                "hint": "Send a multipart/form-data request with field 'image' to /disease/analyze.",
            }
        if tool == "size":
            # simple passthrough hint for now
            return {
                "tool": "size",
                "hint": "POST JSON payload to /size/estimate.",
            }
        # default crop
        return {
            "tool": "crop",
            "hint": "POST JSON { 'features': {...} } to /crop/recommend.",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration failed: {e}")


@app.post("/chat")
def chat(req: ChatRequest):
    """LLM chat endpoint - processes messages and calls models directly"""
    try:
        conversation_id = req.conversationId or f"conv-{int(datetime.now().timestamp() * 1000)}"
        result = llm_orchestrator.process_message(conversation_id, req.message)
        
        return {
            "message": {
                "content": result["content"],
                "role": "assistant",
                "timestamp": datetime.now().isoformat()
            },
            "conversationId": conversation_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {e}")


if __name__ == "__main__":
    import sys
    import uvicorn
    
    # Add parent directory to path if running from smart_agri_models directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)
    
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("smart_agri_models.main:app", host="0.0.0.0", port=port, reload=False)
