"""
Test Image Upload to MCB
"""
import asyncio
import aiohttp
import os

async def test_image_upload():
    """Test image upload to MCB"""
    print("🧪 Testing MCB Image Upload")
    print("=" * 40)
    
    # Create a simple test image file (1x1 pixel PNG)
    test_image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x12IDATx\x9cc```bPPP\x00\x02\xd2\x00\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    
    async with aiohttp.ClientSession() as session:
        # Test 1: Direct MCB API
        print("\n1. Testing Direct MCB API...")
        try:
            data = aiohttp.FormData()
            data.add_field('message', 'What is wrong with this plant?')
            data.add_field('user_id', 'test_user')
            data.add_field('user_type', 'farmer')
            data.add_field('file', test_image_data, filename='test.png', content_type='image/png')
            
            async with session.post('http://localhost:8001/mcb/analyze-with-image', data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"   ✅ MCB Direct API: Success")
                    print(f"   🤖 Selected Model: {result.get('selected_model', {}).get('name', 'Unknown')}")
                    print(f"   🎯 Confidence: {result.get('confidence', 0):.2f}")
                else:
                    error_text = await response.text()
                    print(f"   ❌ MCB Direct API Failed: {response.status} - {error_text}")
        except Exception as e:
            print(f"   ❌ MCB Direct API Error: {str(e)}")
        
        # Test 2: Next.js API Route
        print("\n2. Testing Next.js API Route...")
        try:
            data = aiohttp.FormData()
            data.add_field('action', 'analyze-with-image')
            data.add_field('message', 'What is wrong with this plant?')
            data.add_field('user_id', 'test_user')
            data.add_field('user_type', 'farmer')
            data.add_field('file', test_image_data, filename='test.png', content_type='image/png')
            
            async with session.post('http://localhost:3000/api/mcb', data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"   ✅ Next.js API Route: Success")
                    print(f"   🤖 Selected Model: {result.get('selected_model', {}).get('name', 'Unknown')}")
                    print(f"   🎯 Confidence: {result.get('confidence', 0):.2f}")
                else:
                    error_text = await response.text()
                    print(f"   ❌ Next.js API Route Failed: {response.status} - {error_text}")
        except Exception as e:
            print(f"   ❌ Next.js API Route Error: {str(e)}")
    
    print("\n" + "=" * 40)
    print("✅ Image Upload Test Complete!")

if __name__ == "__main__":
    asyncio.run(test_image_upload())
