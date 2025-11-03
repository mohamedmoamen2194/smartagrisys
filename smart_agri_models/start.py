#!/usr/bin/env python3
"""
Simple startup script for MCB
"""

import os
import sys
from dotenv import load_dotenv

def main():
    """Start MCB server"""
    print("🚀 Starting MCB Server...")
    
    # Load environment variables
    load_dotenv()
    
    # Check if running in production
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🌐 Server will start on {host}:{port}")
    print("📋 Available endpoints:")
    print("  - POST /mcb/ask (text responses)")
    print("  - POST /mcb/diagnose-image (image diagnosis)")
    print("  - GET /mcb/help (user help)")
    print("  - GET /docs (API documentation)")
    print()
    
    # Start server
    import uvicorn
    uvicorn.run(
        "mcb.mcb_api:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )

if __name__ == "__main__":
    main()
