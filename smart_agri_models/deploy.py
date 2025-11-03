#!/usr/bin/env python3
"""
Simple deployment script for MCB
"""

import os
import sys

def check_environment():
    """Check if environment is properly configured"""
    print("🔧 Checking Environment Configuration...")
    
    required_vars = [
        "GROQ_API_KEY",
        "LLM_PROVIDER", 
        "MCB_USE_LLM"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please create a .env file with the required variables.")
        return False
    
    print("✅ Environment configuration looks good!")
    return True

def check_models():
    """Check if model files exist"""
    print("\n🤖 Checking Model Files...")
    
    model_files = [
        "crop_rec/crop_recommendation_rf_model (1).joblib",
        "disease_detection/mobilenet_plant_weights.pt"
    ]
    
    missing_files = []
    for file_path in model_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing model files: {', '.join(missing_files)}")
        return False
    
    print("✅ All model files found!")
    return True

def check_dependencies():
    """Check if dependencies are installed"""
    print("\n📦 Checking Dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import torch
        import sklearn
        import PIL
        import requests
        import numpy
        print("✅ All dependencies installed!")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def main():
    """Run deployment checks"""
    print("🚀 MCB Deployment Readiness Check")
    print("=" * 40)
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run checks
    env_ok = check_environment()
    models_ok = check_models()
    deps_ok = check_dependencies()
    
    print("\n📊 Deployment Readiness Summary:")
    print(f"{'✅' if env_ok else '❌'} Environment Configuration")
    print(f"{'✅' if models_ok else '❌'} Model Files")
    print(f"{'✅' if deps_ok else '❌'} Dependencies")
    
    if all([env_ok, models_ok, deps_ok]):
        print("\n🎉 MCB is ready for deployment!")
        print("\nNext steps:")
        print("1. Push code to GitHub")
        print("2. Connect to Vercel")
        print("3. Set environment variables in Vercel")
        print("4. Deploy!")
        
        print("\nTo start locally:")
        print("python -m uvicorn mcb.mcb_api:app --host 0.0.0.0 --port 8001")
    else:
        print("\n⚠️ Please fix the issues above before deploying.")

if __name__ == "__main__":
    main()
