#!/usr/bin/env python3
"""
Debug Groq API connection
"""

import os
import requests
from dotenv import load_dotenv

def test_groq_api():
    """Test Groq API directly"""
    print("🧪 Testing Groq API Connection...")
    
    # Load environment variables
    load_dotenv()
    
    api_key = os.getenv("GROQ_API_KEY")
    print(f"API Key: {'✅ Found' if api_key else '❌ Missing'}")
    
    if not api_key:
        print("\n❌ No GROQ_API_KEY found in environment")
        print("Please run: python setup_env.py")
        return False
    
    # Test simple API call
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": "Hello, respond with just 'OK'"}],
                "max_tokens": 10,
                "temperature": 0.1
            },
            timeout=10
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print(f"✅ Groq API working! Response: {content}")
            return True
        else:
            error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
            print(f"❌ Groq API error {response.status_code}: {error_data}")
            return False
            
    except Exception as e:
        print(f"❌ Groq API request failed: {e}")
        return False

def test_mcb_selection():
    """Test MCB model selection"""
    print("\n🤖 Testing MCB Model Selection...")
    
    try:
        from mcb.decision_engine import CloudLLMSelector
        
        selector = CloudLLMSelector()
        
        # Test queries
        test_queries = [
            "What crop should I plant with nitrogen 25?",
            "My tomato plants have brown spots",
            "Hello, how are you?"
        ]
        
        for query in test_queries:
            print(f"\nQuery: '{query}'")
            try:
                result = selector.select_model(query)
                print(f"✅ Selected: {result.get('selected_model', 'Unknown')}")
            except Exception as e:
                print(f"❌ Selection failed: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ MCB selection test failed: {e}")
        return False

if __name__ == "__main__":
    api_ok = test_groq_api()
    
    if api_ok:
        mcb_ok = test_mcb_selection()
        
        if api_ok and mcb_ok:
            print("\n🎉 All tests passed!")
            print("Your MCB backend should work correctly now.")
        else:
            print("\n⚠️ Some tests failed. Check the errors above.")
    else:
        print("\n🔧 Fix the API key issue first:")
        print("1. Run: python setup_env.py")
        print("2. Check your Groq API key is valid")
        print("3. Run this test again")
