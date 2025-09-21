#!/usr/bin/env python3
"""
Startup script for Smart Agriculture AI API
Run this to start the unified server with all models
"""

import uvicorn
import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Get port from environment variable (Railway sets this)
    port = int(os.environ.get("PORT", 8000))
    
    print("🚀 Starting Smart Agriculture AI API...")
    print(f"📍 Server will be available on port: {port}")
    print("📚 API Documentation: /docs")
    print("🏥 Health Check: /health")
    print("\n" + "="*50)
    
    # Use import string for proper reload functionality
    uvicorn.run(
        "unified_api:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    ) 