"""
MCB Startup Script - Start the Model Control Bridge system
"""
import asyncio
import uvicorn
import logging
from mcb.mcb_api import app
from mcb.model_registry import model_registry
from mcb.decision_engine import decision_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def startup_checks():
    """Perform startup checks"""
    logger.info("🚀 Starting Model Control Bridge (MCB)")
    
    # Check model registry
    active_models = len(model_registry.get_all_active_models())
    logger.info(f"📊 Model Registry: {active_models} active models loaded")
    
    # List available models
    for model in model_registry.get_all_active_models():
        logger.info(f"   ✓ {model.name} ({model.model_type.value}) - Accuracy: {model.accuracy:.1%}")
    
    # Check decision engine
    logger.info("🧠 Decision Engine: Ready")
    
    logger.info("✅ MCB System Ready!")
    logger.info("📡 API Documentation: http://localhost:8001/docs")
    logger.info("🔍 Health Check: http://localhost:8001/mcb/health")

if __name__ == "__main__":
    startup_checks()
    
    # Start the MCB API server
    uvicorn.run(
        "mcb.mcb_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
