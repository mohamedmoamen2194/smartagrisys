"""
Test MCB Model Execution
"""
import asyncio
import aiohttp
import base64
import json

async def test_mcb_execution():
    """Test MCB model execution"""
    print("🧪 Testing MCB Model Execution")
    print("=" * 40)
    
    # Create a simple test image (1x1 pixel PNG) and convert to base64
    test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x12IDATx\x9cc```bPPP\x00\x02\xd2\x00\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    image_base64 = base64.b64encode(test_image_data).decode('utf-8')
    
    async with aiohttp.ClientSession() as session:
        # Test execution endpoint
        print("Testing MCB execution endpoint...")
        
        execution_payload = {
            "model_id": "disease_detection_v1",
            "session_id": "test_session",
            "inputs": {
                "image": image_base64
            }
        }
        
        try:
            async with session.post(
                'http://localhost:8001/mcb/execute',
                json=execution_payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                print(f"Status: {response.status}")
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Execution successful!")
                    print(f"Model used: {result.get('model_used', 'Unknown')}")
                    print(f"Execution time: {result.get('execution_time_ms', 0)}ms")
                    print(f"Result keys: {list(result.get('result', {}).keys())}")
                    
                    if 'disease' in result.get('result', {}):
                        disease_result = result['result']
                        print(f"Disease: {disease_result.get('disease', 'Unknown')}")
                        print(f"Confidence: {disease_result.get('confidence', 0):.2f}")
                else:
                    error_text = await response.text()
                    print(f"❌ Execution failed: {error_text}")
                    
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 40)
    print("✅ Execution Test Complete!")

if __name__ == "__main__":
    asyncio.run(test_mcb_execution())
