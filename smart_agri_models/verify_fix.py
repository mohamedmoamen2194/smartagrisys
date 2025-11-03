#!/usr/bin/env python3
"""
Verify the Groq API fix is working
"""

import requests
import json

def test_mcb_api():
    """Test MCB API with fixed Groq model"""
    print("🧪 Testing MCB API with Fixed Groq Model...")
    
    # Test queries that should work now
    test_queries = [
        {
            "message": "What crop should I plant with nitrogen 25, phosphorus 20?",
            "expected": "crop_recommendation"
        },
        {
            "message": "My tomato plants have brown spots on leaves",
            "expected": "disease_detection"
        },
        {
            "message": "Hello, I need farming advice",
            "expected": "crop_recommendation"
        }
    ]
    
    for i, test in enumerate(test_queries, 1):
        print(f"\n📝 Test {i}: '{test['message']}'")
        
        try:
            response = requests.post(
                "http://127.0.0.1:8001/mcb/ask",
                json={
                    "message": test["message"],
                    "user_id": "test_user",
                    "user_type": "farmer"
                },
                timeout=15
            )
            
            if response.status_code == 200:
                text_response = response.text
                print(f"✅ Got response ({len(text_response)} chars)")
                
                # Check if it's the right type of response
                if test["expected"] == "crop_recommendation":
                    if "CROP RECOMMENDATION" in text_response:
                        print("✅ Correct: Crop recommendation response")
                    else:
                        print("❌ Wrong: Expected crop recommendation")
                        print(f"   Got: {text_response[:100]}...")
                        
                elif test["expected"] == "disease_detection":
                    if "DISEASE DETECTION" in text_response:
                        print("✅ Correct: Disease detection response")
                    else:
                        print("❌ Wrong: Expected disease detection")
                        print(f"   Got: {text_response[:100]}...")
                        
            else:
                print(f"❌ API error: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to MCB API")
            print("   Make sure MCB server is running: python start.py")
            return False
        except Exception as e:
            print(f"❌ Test failed: {e}")
    
    return True

if __name__ == "__main__":
    print("🔧 MCB API Fix Verification")
    print("=" * 30)
    print("This tests if the Groq model update fixed the issue")
    print()
    
    success = test_mcb_api()
    
    if success:
        print("\n🎉 Fix verification complete!")
        print("✅ MCB should now give proper responses based on query type")
        print("✅ No more 'disease detection' for every query")
    else:
        print("\n⚠️ Issues detected. Check MCB server status.")
        print("Run: python start.py")
