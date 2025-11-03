#!/usr/bin/env python3
"""
Setup environment for MCB backend
"""

import os
import shutil

def setup_environment():
    """Setup .env file for MCB backend"""
    print("🔧 Setting up MCB Backend Environment...")
    
    # Check if .env already exists
    if os.path.exists('.env'):
        print("✅ .env file already exists")
        return
    
    # Copy from env_config.env
    if os.path.exists('env_config.env'):
        shutil.copy('env_config.env', '.env')
        print("✅ Created .env file from env_config.env")
    else:
        # Create .env file with default values
        env_content = """# MCB Backend Environment Configuration

# LLM Provider Configuration
LLM_PROVIDER=groq
# Provide your key locally; do not hardcode real secrets
GROQ_API_KEY=

# MCB Configuration
MCB_USE_LLM=true
MCB_FALLBACK_TO_RULES=true
MCB_DYNAMIC_EXTRACTION=true
MCB_DYNAMIC_TREATMENTS=true

# Model Configuration
CROP_MODEL_PATH=./crop_rec/crop_recommendation_rf_model (1).joblib
DISEASE_MODEL_PATH=./disease_detection/mobilenet_plant_weights.pt
"""
        
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with default configuration")
    
    print("\n📋 Environment variables configured:")
    print("   - LLM_PROVIDER=groq")
    print("   - GROQ_API_KEY=configured")
    print("   - MCB_USE_LLM=true")
    print("\n🚀 You can now start the MCB server:")
    print("   python start.py")

def test_environment():
    """Test if environment is properly configured"""
    print("\n🧪 Testing Environment Configuration...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check required variables
    groq_key = os.getenv("GROQ_API_KEY")
    llm_provider = os.getenv("LLM_PROVIDER")
    use_llm = os.getenv("MCB_USE_LLM")
    
    print(f"   LLM Provider: {llm_provider}")
    print(f"   Groq API Key: {'✅ Set' if groq_key else '❌ Missing'}")
    print(f"   Use LLM: {use_llm}")
    
    if groq_key and llm_provider == "groq":
        print("\n✅ Environment looks good!")
        return True
    else:
        print("\n❌ Environment configuration issues detected")
        return False

if __name__ == "__main__":
    setup_environment()
    test_environment()
