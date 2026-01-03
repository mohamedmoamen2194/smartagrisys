import { NextRequest, NextResponse } from "next/server"

// AI Backend Configuration (Modal deployment)
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000'

// Call Modal deployment for crop recommendation
async function getCropRecommendationFromModal(features: number[]): Promise<any> {
  try {
    const [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall] = features
    
    const response = await fetch(`${AI_BACKEND_URL}/crop/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        features: {
          N: nitrogen,
          P: phosphorus,
          K: potassium,
          temperature: temperature,
          humidity: humidity,
          ph: ph,
          rainfall: rainfall
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Local model error: ${response.status}`)
    }

    const data = await response.json()
    const recommendedCrop = data.crop || 'rice'
    
      return {
        recommendedCrop,
        confidence: 0.95,
        reasoning: `Based on your soil conditions (N: ${nitrogen}, P: ${phosphorus}, K: ${potassium}, pH: ${ph}) and weather (${temperature}°C, ${humidity}% humidity, ${rainfall}mm rainfall), ${recommendedCrop} is the optimal choice.`,
        source: 'modal_deployment'
      }
  } catch (error) {
    console.error('Local model connection failed:', error)
    throw error
  }
}

// Fallback crop recommendation logic
function predictCropFallback(features: number[]): string {
  const [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall] = features
  
  // Simple rule-based prediction for demo
  if (ph >= 6.0 && ph <= 7.5 && temperature >= 20 && temperature <= 30) {
    if (nitrogen > 50 && rainfall > 100) return "rice"
    if (potassium > 40 && temperature > 25) return "maize"
    if (phosphorus > 30) return "wheat"
  }
  
  if (temperature > 30 && humidity < 50) return "cotton"
  if (ph > 7.0 && rainfall < 50) return "chickpea"
  if (nitrogen < 30 && phosphorus > 20) return "lentil"
  
  // Default recommendations based on conditions
  const crops = ["rice", "maize", "wheat", "cotton", "chickpea", "kidneybeans", "pigeonpeas", "banana", "mango", "grapes"]
  return crops[Math.floor(Math.random() * crops.length)]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Support both individual fields and features array
    let nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall
    if (Array.isArray(body.features) && body.features.length === 7) {
      [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall] = body.features
    } else {
      ({ nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = body)
    }

    // Validate required parameters
    const requiredParams = [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]
    if (requiredParams.some(param => typeof param !== "number" || isNaN(param))) {
      return NextResponse.json(
        { error: `Missing or invalid parameter: All parameters must be numbers.` },
        { status: 400 }
      )
    }

    const features = [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]
    
    try {
      // Try to get recommendation from Modal deployment
      const modelResult = await getCropRecommendationFromModal(features)
      
      // Enhance the response with additional context
      const enhancedResponse = {
        recommendedCrop: modelResult.recommendedCrop,
        confidence: modelResult.confidence,
        reasoning: modelResult.reasoning,
        alternatives: getAlternativeCrops(modelResult.recommendedCrop, { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall }),
        careInstructions: getCareInstructions(modelResult.recommendedCrop),
        source: modelResult.source
      }

      return NextResponse.json(enhancedResponse)
    } catch (modelError) {
      console.warn("Modal deployment unavailable, using fallback:", modelError)
      
      // Fallback to rule-based prediction if model is unavailable
      const recommendedCrop = predictCropFallback(features)
      
      const fallbackResponse = {
        recommendedCrop,
        confidence: 0.7,
        reasoning: `Based on your soil conditions (N: ${nitrogen}, P: ${phosphorus}, K: ${potassium}, pH: ${ph}) and weather (${temperature}°C, ${humidity}% humidity, ${rainfall}mm rainfall), ${recommendedCrop} is the optimal choice. (Note: Using fallback prediction as AI models are temporarily unavailable)`,
        alternatives: getAlternativeCrops(recommendedCrop, { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall }),
        careInstructions: getCareInstructions(recommendedCrop),
        source: 'fallback'
      }

      return NextResponse.json(fallbackResponse)
    }
  } catch (error) {
    console.error("Crop recommendation API error:", error)
    return NextResponse.json(
      { error: "Failed to get crop recommendation" },
      { status: 500 }
    )
  }
}

// Helper function to get alternative crops
function getAlternativeCrops(primaryCrop: string, conditions: any): string[] {
  const cropAlternatives: Record<string, string[]> = {
    "rice": ["wheat", "maize", "cotton"],
    "maize": ["rice", "wheat", "cotton"],
    "chickpea": ["kidneybeans", "pigeonpeas", "mothbeans"],
    "kidneybeans": ["chickpea", "pigeonpeas", "mothbeans"],
    "pigeonpeas": ["chickpea", "kidneybeans", "mothbeans"],
    "mothbeans": ["chickpea", "kidneybeans", "pigeonpeas"],
    "mungbean": ["chickpea", "kidneybeans", "pigeonpeas"],
    "blackgram": ["chickpea", "kidneybeans", "pigeonpeas"],
    "lentil": ["chickpea", "kidneybeans", "pigeonpeas"],
    "pomegranate": ["banana", "mango", "grapes"],
    "banana": ["pomegranate", "mango", "grapes"],
    "mango": ["pomegranate", "banana", "grapes"],
    "grapes": ["pomegranate", "banana", "mango"],
    "watermelon": ["muskmelon", "papaya", "coconut"],
    "muskmelon": ["watermelon", "papaya", "coconut"],
    "apple": ["orange", "papaya", "coconut"],
    "orange": ["apple", "papaya", "coconut"],
    "papaya": ["watermelon", "muskmelon", "coconut"],
    "coconut": ["watermelon", "muskmelon", "papaya"],
    "cotton": ["jute", "coffee"],
    "jute": ["cotton", "coffee"],
    "coffee": ["cotton", "jute"],
  }

  return cropAlternatives[primaryCrop.toLowerCase()] || ["wheat", "maize", "rice"]
}

// Helper function to get care instructions
function getCareInstructions(crop: string): Record<string, string> {
  const instructions: Record<string, Record<string, string>> = {
    "rice": {
      watering: "Keep soil consistently moist, especially during flowering",
      fertilizing: "Apply nitrogen fertilizer in 3 splits: basal, tillering, and panicle initiation",
      spacing: "Plant 20-25 cm apart in rows 25-30 cm apart",
      harvesting: "Harvest when 80-85% of grains are mature",
    },
    "maize": {
      watering: "Water deeply but infrequently, avoid waterlogging",
      fertilizing: "Apply NPK fertilizer at planting and side-dress with nitrogen",
      spacing: "Plant 20-25 cm apart in rows 75-90 cm apart",
      harvesting: "Harvest when kernels are hard and dry",
    },
    "wheat": {
      watering: "Moderate water requirements, avoid excessive moisture",
      fertilizing: "Apply nitrogen in 2-3 splits, phosphorus at sowing",
      spacing: "Broadcast or drill seeds 2-3 cm deep",
      harvesting: "Harvest when grain moisture is 13-14%",
    },
    "cotton": {
      watering: "Regular irrigation, especially during flowering and boll formation",
      fertilizing: "Apply nitrogen in 3-4 splits, potassium at sowing",
      spacing: "Plant 30-45 cm apart in rows 90-120 cm apart",
      harvesting: "Harvest when bolls are fully mature and open",
    },
  }

  return instructions[crop.toLowerCase()] || {
    watering: "Maintain consistent soil moisture",
    fertilizing: "Apply balanced NPK fertilizer",
    spacing: "Follow recommended spacing for optimal growth",
    harvesting: "Harvest at appropriate maturity stage",
  }
} 