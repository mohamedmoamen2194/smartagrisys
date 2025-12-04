import json
from typing import Dict
import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "llama3.2:instruct"

SYSTEM_PROMPT = (
    "You are an orchestrator. Given a user message, choose one tool to call "
    "from: disease, crop, size. Output strict JSON: {\"tool\": string, \"args\": object}. "
    "Decide based on intent: image disease analysis -> disease; crop recommendation -> crop; fruit size -> size."
)


def _ollama_generate(prompt: str) -> str:
    payload = {
        "model": MODEL_NAME,
        "prompt": f"System: {SYSTEM_PROMPT}\nUser: {prompt}\nAssistant:",
        "stream": False,
        "options": {"temperature": 0.1}
    }
    r = requests.post(OLLAMA_URL, json=payload, timeout=20)
    r.raise_for_status()
    data = r.json()
    return data.get("response", "{}")


def route_intent(message: str) -> Dict:
    try:
        raw = _ollama_generate(message)
        raw = raw.strip()
        if not raw.startswith("{"):
            start = raw.find("{")
            end = raw.rfind("}")
            if start != -1 and end != -1:
                raw = raw[start:end+1]
        obj = json.loads(raw)
        if isinstance(obj, dict) and "tool" in obj:
            return obj
    except Exception:
        pass

    m = message.lower()
    if any(k in m for k in ["disease", "leaf", "plant image", "detect"]):
        return {"tool": "disease", "args": {}}
    if any(k in m for k in ["recommend", "crop", "what to plant", "best crop"]):
        return {"tool": "crop", "args": {}}
    if any(k in m for k in ["size", "measure", "fruit size", "weight"]):
        return {"tool": "size", "args": {}}
    return {"tool": "crop", "args": {}}
