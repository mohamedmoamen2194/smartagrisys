import { NextRequest, NextResponse } from 'next/server'

// Mock MCB responses for development/demo
const MOCK_MODELS = [
  {
    id: "crop_recommendation_v1",
    name: "Crop Recommendation",
    type: "crop_recommendation",
    description: "AI model for recommending optimal crops based on soil and weather conditions",
    confidence: 0.95,
    supported_inputs: ["soil_data", "weather_data", "text_query"]
  },
  {
    id: "disease_detection_v1", 
    name: "Plant Disease Detection",
    type: "disease_detection",
    description: "Computer vision model for detecting plant diseases from images",
    confidence: 0.92,
    supported_inputs: ["image", "text_query"]
  },
  {
    id: "fruit_sizing_v1",
    name: "Fruit Sizing Analysis", 
    type: "fruit_sizing",
    description: "AI model for analyzing fruit size and quality from images",
    confidence: 0.88,
    supported_inputs: ["image", "text_query"]
  }
]

// Mock responses based on query type
function getMockResponse(query: string, userType: string = "farmer") {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('crop') || lowerQuery.includes('plant') || lowerQuery.includes('grow')) {
    return {
      selected_model: MOCK_MODELS[0],
      confidence: 0.95,
      reasoning: "Query contains crop-related keywords, selecting crop recommendation model",
      response: `Based on your soil conditions and local climate, I recommend planting **Corn** this season. 

🌱 **Why Corn?**
- Your soil pH (6.5) is ideal for corn cultivation
- Current rainfall patterns support corn growth
- Temperature range is optimal (20-25°C)

📊 **Expected Results:**
- Growth period: 90-120 days
- Expected yield: 8-12 tons per hectare
- Best planting time: Next 2-3 weeks

Would you like specific planting tips or soil preparation advice?`,
      session_id: `session_${Date.now()}`
    }
  }
  
  if (lowerQuery.includes('disease') || lowerQuery.includes('sick') || lowerQuery.includes('problem')) {
    return {
      selected_model: MOCK_MODELS[1],
      confidence: 0.92,
      reasoning: "Query mentions plant health issues, selecting disease detection model",
      response: `I can help you identify plant diseases! 🔍

**For accurate diagnosis, please:**
1. Upload a clear photo of the affected plant parts
2. Include leaves, stems, or fruits showing symptoms
3. Ensure good lighting in the photo

**Common symptoms to look for:**
- 🍃 Leaf discoloration or spots
- 🦠 Wilting or unusual growth
- 🍎 Fruit abnormalities

Upload an image and I'll analyze it using advanced AI to identify the issue and suggest treatment options.`,
      session_id: `session_${Date.now()}`
    }
  }
  
  if (lowerQuery.includes('size') || lowerQuery.includes('fruit') || lowerQuery.includes('quality')) {
    return {
      selected_model: MOCK_MODELS[2], 
      confidence: 0.88,
      reasoning: "Query relates to fruit analysis, selecting fruit sizing model",
      response: `I can analyze your fruit size and quality! 📏🍎

**Upload a photo of your fruits and I'll provide:**
- Accurate size measurements
- Quality assessment
- Market grade classification
- Harvest timing recommendations

**Tips for best results:**
- Place a coin or ruler for scale reference
- Use good lighting
- Show multiple fruits if possible
- Include the whole fruit in the frame

Ready to analyze your harvest?`,
      session_id: `session_${Date.now()}`
    }
  }
  
  // Default general agricultural advice
  return {
    selected_model: MOCK_MODELS[0],
    confidence: 0.85,
    reasoning: "General agricultural query, using crop recommendation model for comprehensive advice",
    response: `Hello! 👋 I'm your AI agricultural assistant powered by MCB (Model Control Bridge).

**I can help you with:**
🌱 **Crop Recommendations** - What to plant based on your conditions
🔍 **Disease Detection** - Identify plant diseases from photos  
📏 **Fruit Analysis** - Size and quality assessment
💡 **General Advice** - Farming tips and best practices

**What would you like help with today?**
- Ask about crop selection
- Upload a plant photo for disease diagnosis
- Get fruit sizing analysis
- Request farming advice

I automatically select the best AI model for your specific question!`,
    session_id: `session_${Date.now()}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (for image uploads)
      const formData = await request.formData()
      const action = formData.get('action') as string
      const message = formData.get('message') as string || ''
      const image = formData.get('image') as File
      
      if (action === 'analyze-with-image' || image) {
        // Mock image analysis response
        const mockResponse = {
          selected_model: MOCK_MODELS[1], // Disease detection model
          confidence: 0.94,
          reasoning: "Image uploaded, using disease detection model for analysis",
          response: `🔍 **Image Analysis Complete!**

**Detected Issue:** Early Blight (Alternaria solani)
**Confidence:** 94%

**Symptoms Identified:**
- Dark brown spots with concentric rings on leaves
- Yellowing around affected areas
- Early stage infection detected

**Recommended Treatment:**
1. 🧴 Apply copper-based fungicide immediately
2. ✂️ Remove affected leaves and dispose properly
3. 💧 Improve air circulation around plants
4. 🚫 Avoid overhead watering

**Prevention Tips:**
- Space plants adequately
- Apply mulch to prevent soil splash
- Water at soil level, not on leaves
- Monitor regularly for early detection

**Follow-up:** Check plants in 7-10 days. If symptoms persist, consider stronger fungicide treatment.`,
          session_id: `session_${Date.now()}`,
          image_processed: true
        }
        
        return NextResponse.json(mockResponse)
      }
    } else {
      // Handle JSON data
      const body = await request.json()
      const { action, message, user_type, ...data } = body

      switch (action) {
        case 'chat':
        case 'analyze':
          const mockResponse = getMockResponse(message || '', user_type || 'farmer')
          return NextResponse.json({
            type: 'complete_response',
            analysis: mockResponse,
            result: {
              response: mockResponse.response,
              model_used: mockResponse.selected_model.name,
              confidence: mockResponse.confidence
            }
          })
          
        case 'get-models':
        case 'models':
          return NextResponse.json({
            models: MOCK_MODELS,
            status: 'available',
            total: MOCK_MODELS.length
          })
          
        case 'health':
          return NextResponse.json({
            status: 'healthy',
            mcb_available: true,
            models_loaded: MOCK_MODELS.length,
            version: '2.0.0-mock'
          })
          
        default:
          // Default to chat functionality
          const defaultResponse = getMockResponse(message || 'hello', user_type || 'farmer')
          return NextResponse.json({
            type: 'complete_response', 
            analysis: defaultResponse,
            result: {
              response: defaultResponse.response,
              model_used: defaultResponse.selected_model.name,
              confidence: defaultResponse.confidence
            }
          })
      }
    }

  } catch (error) {
    console.error('MCB API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'health'

    switch (action) {
      case 'models':
        return NextResponse.json({
          models: MOCK_MODELS,
          status: 'available',
          total: MOCK_MODELS.length
        })
        
      case 'health':
        return NextResponse.json({
          status: 'healthy',
          mcb_available: true,
          models_loaded: MOCK_MODELS.length,
          version: '2.0.0-mock',
          uptime: '24h 15m',
          last_updated: new Date().toISOString()
        })
        
      case 'stats':
        return NextResponse.json({
          total_queries: 1247,
          models_used: {
            crop_recommendation: 523,
            disease_detection: 456,
            fruit_sizing: 268
          },
          average_confidence: 0.91,
          success_rate: 0.97,
          uptime: '99.8%'
        })
        
      default:
        return NextResponse.json({
          status: 'healthy',
          mcb_available: true,
          models_loaded: MOCK_MODELS.length,
          version: '2.0.0-mock'
        })
    }

  } catch (error) {
    console.error('MCB API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
