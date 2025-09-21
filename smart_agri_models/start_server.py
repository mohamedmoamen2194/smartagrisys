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
    print("🚀 Starting Smart Agriculture AI API...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("\n" + "="*50)
    
    # Use import string for proper reload functionality
    uvicorn.run(
        "unified_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 