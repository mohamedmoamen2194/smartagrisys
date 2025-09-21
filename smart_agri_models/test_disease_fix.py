"""
Test Disease Detection Fix
"""
import asyncio
import json
from mcb.decision_engine import decision_engine, UserContext

async def test_disease_detection_fix():
    """Test disease detection with text-only queries"""
    print("🧪 Testing Disease Detection Fix")
    print("=" * 40)
    
    user_context = UserContext(
        user_id="test_farmer",
        user_type="farmer",
        location="Test Farm"
    )
    
    disease_queries = [
        "My tomato plants have brown spots on the leaves",
        "What's wrong with my plant? The leaves are wilting",
        "I think my crops have some kind of disease",
        "My plants look sick and unhealthy",
        "There are yellow spots on my plant leaves",
        "Help me diagnose plant disease"
    ]
    
    print("Testing disease detection queries without images...")
    
    for i, query in enumerate(disease_queries, 1):
        print(f"\n{i}. Query: '{query}'")
        
        try:
            # Analyze input (no image)
            analysis = decision_engine.analyze_input(
                user_input=query,
                context=user_context,
                has_image=False
            )
            
            print(f"   Intent: {analysis.intent.value}")
            print(f"   Keywords: {analysis.keywords_found[:3]}")
            
            # Get model recommendation
            recommendation = decision_engine.recommend_model(analysis, user_context)
            
            print(f"   ✅ Selected Model: {recommendation.model.name}")
            print(f"   🎯 Confidence: {recommendation.confidence:.2f}")
            print(f"   📝 Required Inputs: {list(recommendation.required_inputs.keys())}")
            
            if recommendation.required_inputs:
                for input_name, input_info in recommendation.required_inputs.items():
                    print(f"      - {input_name}: {input_info.get('description', 'No description')}")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 40)
    print("✅ Disease Detection Fix Test Complete!")

if __name__ == "__main__":
    asyncio.run(test_disease_detection_fix())
