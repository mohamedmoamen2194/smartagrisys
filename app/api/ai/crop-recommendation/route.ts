import { NextRequest, NextResponse } from "next/server"

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8000"

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

    // Call the Python backend
    const response = await fetch(`${AI_BACKEND_URL}/crop_rec/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        features: [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || "Error from crop recommendation service" },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Enhance the response with additional context
    const enhancedResponse = {
      recommendedCrop: data.crop,
      confidence: "high", // You can add confidence scoring logic
      reasoning: `Based on your soil conditions (N: ${nitrogen}, P: ${phosphorus}, K: ${potassium}, pH: ${ph}) and weather (${temperature}°C, ${humidity}% humidity, ${rainfall}mm rainfall), ${data.crop} is the optimal choice.`,
      alternatives: getAlternativeCrops(data.crop, { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall }),
      careInstructions: getCareInstructions(data.crop),
    }

    return NextResponse.json(enhancedResponse)
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