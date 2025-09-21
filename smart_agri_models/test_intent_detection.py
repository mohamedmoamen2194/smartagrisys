"""
Test Intent Detection for Disease Queries
"""
import asyncio
from mcb.decision_engine import decision_engine, UserContext

async def test_intent_detection():
    """Test intent detection for disease-related queries"""
    print("🧪 Testing Intent Detection for Disease Queries")
    print("=" * 50)
    
    user_context = UserContext(
        user_id="test_user",
        user_type="farmer"
    )
    
    test_cases = [
        {
            "query": "What is wrong with this plant?",
            "has_image": True,
            "expected": "disease_detection"
        },
        {
            "query": "My plant looks sick",
            "has_image": True,
            "expected": "disease_detection"
        },
        {
            "query": "Help me diagnose plant disease",
            "has_image": True,
            "expected": "disease_detection"
        },
        {
            "query": "What crop should I plant?",
            "has_image": False,
            "expected": "crop_recommendation"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Query: '{test_case['query']}'")
        print(f"   Has Image: {test_case['has_image']}")
        
        # Analyze input
        analysis = decision_engine.analyze_input(
            user_input=test_case["query"],
            context=user_context,
            has_image=test_case["has_image"]
        )
        
        print(f"   Intent Detected: {analysis.intent.value}")
        print(f"   Keywords Found: {analysis.keywords_found}")
        print(f"   Entities: {analysis.extracted_entities}")
        
        # Get model recommendation
        try:
            recommendation = decision_engine.recommend_model(analysis, user_context)
            print(f"   Selected Model: {recommendation.model.name}")
            print(f"   Model Type: {recommendation.model.model_type.value}")
            print(f"   Confidence: {recommendation.confidence:.2f}")
            
            # Check if correct model type was selected
            if test_case["expected"] in recommendation.model.model_type.value:
                print(f"   ✅ CORRECT model type selected!")
            else:
                print(f"   ❌ WRONG model type. Expected: {test_case['expected']}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Intent Detection Test Complete!")

if __name__ == "__main__":
    asyncio.run(test_intent_detection())
