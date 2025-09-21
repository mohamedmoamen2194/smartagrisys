"""
MCB Test Script - Test the Model Control Bridge system
"""
import asyncio
import json
from mcb.model_registry import model_registry
from mcb.decision_engine import decision_engine, UserContext

async def test_mcb_system():
    """Test the MCB system components"""
    print("🧪 Testing Model Control Bridge (MCB) System")
    print("=" * 50)
    
    # Test 1: Model Registry
    print("\n1. Testing Model Registry...")
    active_models = model_registry.get_all_active_models()
    print(f"   ✓ Found {len(active_models)} active models:")
    for model in active_models:
        print(f"     - {model.name} ({model.model_type.value}) - {model.accuracy:.1%} accuracy")
    
    # Test 2: Decision Engine - Disease Detection
    print("\n2. Testing Decision Engine - Disease Detection...")
    user_context = UserContext(
        user_id="test_farmer",
        user_type="farmer",
        location="California"
    )
    
    test_queries = [
        {
            "query": "My plant leaves have brown spots and are wilting",
            "has_image": True,
            "expected_model": "disease_detection"
        },
        {
            "query": "What crop should I plant with nitrogen 20, phosphorus 15, potassium 25?",
            "has_image": False,
            "expected_model": "crop_recommendation"
        },
        {
            "query": "Help me identify this plant disease",
            "has_image": True,
            "expected_model": "disease_detection"
        },
        {
            "query": "I need crop recommendations for my soil conditions",
            "has_image": False,
            "expected_model": "crop_recommendation"
        }
    ]
    
    for i, test_case in enumerate(test_queries, 1):
        print(f"\n   Test {i}: '{test_case['query']}'")
        
        analysis = decision_engine.analyze_input(
            user_input=test_case["query"],
            context=user_context,
            has_image=test_case["has_image"]
        )
        
        print(f"     Intent: {analysis.intent.value} (confidence: {analysis.confidence:.2f})")
        print(f"     Keywords found: {analysis.keywords_found[:3]}")
        
        try:
            recommendation = decision_engine.recommend_model(analysis, user_context)
            print(f"     Selected Model: {recommendation.model.name}")
            print(f"     Confidence: {recommendation.confidence:.2f}")
            print(f"     Reasoning: {recommendation.reasoning[:100]}...")
            
            # Check if correct model type was selected
            expected_type = test_case["expected_model"]
            actual_type = recommendation.model.model_type.value
            if expected_type in actual_type:
                print(f"     ✓ Correct model type selected!")
            else:
                print(f"     ⚠ Expected {expected_type}, got {actual_type}")
                
        except Exception as e:
            print(f"     ❌ Error: {str(e)}")
    
    # Test 3: Model Registry Search
    print("\n3. Testing Model Registry Search...")
    search_terms = ["disease", "crop", "plant", "soil"]
    
    for term in search_terms:
        results = model_registry.search_models_by_keywords(term)
        print(f"   Search '{term}': {len(results)} models found")
        for model in results[:2]:  # Show top 2
            print(f"     - {model.name} (accuracy: {model.accuracy:.1%})")
    
    # Test 4: Input Analysis
    print("\n4. Testing Input Analysis...")
    test_inputs = [
        "My tomato plants have blight disease",
        "What's the best crop for pH 6.5 and high nitrogen?",
        "Upload image of sick plant leaves",
        "Need help with crop planning for next season"
    ]
    
    for input_text in test_inputs:
        analysis = decision_engine.analyze_input(input_text, user_context)
        print(f"   '{input_text[:30]}...'")
        print(f"     Intent: {analysis.intent.value}")
        print(f"     Entities: {list(analysis.extracted_entities.keys())}")
        print(f"     Keywords: {len(analysis.keywords_found)} found")
    
    print("\n" + "=" * 50)
    print("✅ MCB System Test Complete!")
    print("\nNext Steps:")
    print("1. Start the MCB API server: python start_mcb.py")
    print("2. Start your Next.js app: npm run dev")
    print("3. Visit: http://localhost:3000/mcb-test")

if __name__ == "__main__":
    asyncio.run(test_mcb_system())
