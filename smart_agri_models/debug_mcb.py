"""
Debug MCB Issues - Test connectivity to AI models
"""
import asyncio
import aiohttp
import json

async def test_ai_models_connectivity():
    """Test if AI models are accessible"""
    print("🔍 Testing AI Models Connectivity")
    print("=" * 40)
    
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        # Test 1: Health check
        try:
            print("\n1. Testing AI Models Health...")
            async with session.get(f"{base_url}/health") as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"   ✅ AI Models Server: {result.get('status', 'unknown')}")
                    print(f"   📊 Available models: {list(result.get('models', {}).keys())}")
                else:
                    print(f"   ❌ Health check failed: Status {response.status}")
        except Exception as e:
            print(f"   ❌ Cannot connect to AI models server: {str(e)}")
            print(f"   💡 Make sure to start: python unified_api.py")
            return False
        
        # Test 2: Crop recommendation
        try:
            print("\n2. Testing Crop Recommendation...")
            test_data = {
                "features": [20, 15, 25, 25.0, 60.0, 6.5, 100.0]
            }
            
            async with session.post(f"{base_url}/crop_rec/predict", json=test_data) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"   ✅ Crop recommendation: {result.get('crop', 'unknown')}")
                else:
                    error_text = await response.text()
                    print(f"   ❌ Crop recommendation failed: {error_text}")
        except Exception as e:
            print(f"   ❌ Crop recommendation error: {str(e)}")
        
        # Test 3: MCB Health
        try:
            print("\n3. Testing MCB Health...")
            async with session.get("http://localhost:8001/mcb/health") as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"   ✅ MCB Server: {result.get('status', 'unknown')}")
                    print(f"   📊 Active models: {result.get('active_models', 0)}")
                else:
                    print(f"   ❌ MCB health check failed: Status {response.status}")
        except Exception as e:
            print(f"   ❌ Cannot connect to MCB server: {str(e)}")
        
        return True

async def test_mcb_analysis():
    """Test MCB analysis endpoint"""
    print("\n4. Testing MCB Analysis...")
    
    test_query = {
        "message": "What crop should I plant with nitrogen 20, phosphorus 15, potassium 25?",
        "user_id": "test_user",
        "user_type": "farmer"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post("http://localhost:8001/mcb/analyze", json=test_query) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"   ✅ MCB Analysis successful")
                    print(f"   🤖 Selected Model: {result.get('selected_model', {}).get('name', 'unknown')}")
                    print(f"   🎯 Confidence: {result.get('confidence', 0):.2f}")
                    print(f"   📝 Reasoning: {result.get('reasoning', 'No reasoning')[:100]}...")
                else:
                    error_text = await response.text()
                    print(f"   ❌ MCB Analysis failed: {error_text}")
        except Exception as e:
            print(f"   ❌ MCB Analysis error: {str(e)}")

async def main():
    """Main debug function"""
    await test_ai_models_connectivity()
    await test_mcb_analysis()
    
    print("\n" + "=" * 40)
    print("🔧 SOLUTION:")
    print("1. Start AI Models Server: python unified_api.py")
    print("2. Keep MCB Server running: python start_mcb.py")
    print("3. Test again with: python debug_mcb.py")

if __name__ == "__main__":
    asyncio.run(main())
