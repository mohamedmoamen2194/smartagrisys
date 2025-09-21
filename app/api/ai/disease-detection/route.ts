import { NextRequest, NextResponse } from "next/server"

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File
    const cropType = formData.get("cropType") as string

    if (!image) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      )
    }

    // Validate image file
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Create new FormData for the backend
    const backendFormData = new FormData()
    backendFormData.append("file", image)
    if (cropType) {
      backendFormData.append("crop_type", cropType)
    }

    // Call the Python backend (try unified endpoint first, then fallback to independent)
    let response = await fetch(`${AI_BACKEND_URL}/disease_detection/predict`, {
      method: "POST",
      body: backendFormData,
    })

    // If unified endpoint is not found, try the independent endpoint
    if (response.status === 404) {
      response = await fetch(`${AI_BACKEND_URL}/predict`, {
        method: "POST",
        body: backendFormData,
      })
    }

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || "Error from disease detection service" },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Enhance the response with treatment recommendations
    const enhancedResponse = {
      disease: data.disease,
      confidence: data.confidence,
      severity: getDiseaseSeverity(data.disease),
      treatment: getTreatmentRecommendations(data.disease, cropType),
      prevention: getPreventionTips(data.disease),
      symptoms: getDiseaseSymptoms(data.disease),
      nextSteps: getNextSteps(data.disease, data.confidence),
    }

    return NextResponse.json(enhancedResponse)
  } catch (error) {
    console.error("Disease detection API error:", error)
    return NextResponse.json(
      { error: "Failed to detect plant disease" },
      { status: 500 }
    )
  }
}

// Helper function to determine disease severity
function getDiseaseSeverity(disease: string): "low" | "medium" | "high" {
  const highSeverityDiseases = [
    "late_blight", "early_blight", "bacterial_spot", "bacterial_wilt",
    "fusarium_wilt", "verticillium_wilt", "powdery_mildew"
  ]
  
  const mediumSeverityDiseases = [
    "leaf_mold", "septoria_leaf_spot", "target_spot", "spider_mites"
  ]

  const diseaseLower = disease.toLowerCase()
  
  if (highSeverityDiseases.some(d => diseaseLower.includes(d))) return "high"
  if (mediumSeverityDiseases.some(d => diseaseLower.includes(d))) return "medium"
  return "low"
}

// Helper function to get treatment recommendations
function getTreatmentRecommendations(disease: string, cropType?: string): string[] {
  const treatments: Record<string, string[]> = {
    "late_blight": [
      "Remove and destroy infected plant parts immediately",
      "Apply copper-based fungicides every 7-10 days",
      "Improve air circulation around plants",
      "Avoid overhead watering"
    ],
    "early_blight": [
      "Remove infected leaves and stems",
      "Apply fungicides containing chlorothalonil or mancozeb",
      "Mulch around plants to prevent soil splash",
      "Space plants adequately for better air flow"
    ],
    "bacterial_spot": [
      "Remove infected plant material",
      "Apply copper-based bactericides",
      "Avoid working with wet plants",
      "Use disease-resistant varieties in future plantings"
    ],
    "powdery_mildew": [
      "Apply fungicides containing sulfur or neem oil",
      "Improve air circulation",
      "Avoid overhead irrigation",
      "Remove severely infected plants"
    ],
    "healthy": [
      "Continue current care practices",
      "Monitor for early signs of disease",
      "Maintain good plant hygiene",
      "Consider preventive fungicide application"
    ]
  }

  const diseaseLower = disease.toLowerCase()
  for (const [key, treatment] of Object.entries(treatments)) {
    if (diseaseLower.includes(key)) {
      return treatment
    }
  }

  return [
    "Remove infected plant parts",
    "Apply appropriate fungicide or bactericide",
    "Improve growing conditions",
    "Consult with agricultural extension service"
  ]
}

// Helper function to get prevention tips
function getPreventionTips(disease: string): string[] {
  const preventionTips: Record<string, string[]> = {
    "late_blight": [
      "Plant resistant varieties",
      "Avoid overhead irrigation",
      "Space plants adequately",
      "Remove volunteer plants and crop debris"
    ],
    "early_blight": [
      "Use disease-free seeds",
      "Rotate crops annually",
      "Avoid working with wet plants",
      "Maintain proper plant spacing"
    ],
    "bacterial_spot": [
      "Use certified disease-free seeds",
      "Avoid overhead irrigation",
      "Disinfect tools between uses",
      "Remove and destroy infected plants"
    ],
    "powdery_mildew": [
      "Plant resistant varieties",
      "Ensure adequate spacing",
      "Avoid excessive nitrogen fertilization",
      "Maintain good air circulation"
    ]
  }

  const diseaseLower = disease.toLowerCase()
  for (const [key, tips] of Object.entries(preventionTips)) {
    if (diseaseLower.includes(key)) {
      return tips
    }
  }

  return [
    "Use disease-resistant varieties",
    "Practice crop rotation",
    "Maintain good plant hygiene",
    "Monitor plants regularly for early detection"
  ]
}

// Helper function to get disease symptoms
function getDiseaseSymptoms(disease: string): string[] {
  const symptoms: Record<string, string[]> = {
    "late_blight": [
      "Dark, water-soaked lesions on leaves",
      "White fungal growth on underside of leaves",
      "Brown lesions on stems",
      "Rapid plant death in severe cases"
    ],
    "early_blight": [
      "Dark brown spots with concentric rings",
      "Yellowing of leaves around spots",
      "Defoliation starting from bottom",
      "Lesions on stems and fruits"
    ],
    "bacterial_spot": [
      "Small, dark, water-soaked spots",
      "Spots with yellow halos",
      "Lesions on leaves, stems, and fruits",
      "Severe defoliation in wet conditions"
    ],
    "powdery_mildew": [
      "White powdery patches on leaves",
      "Yellowing and curling of leaves",
      "Stunted growth",
      "Reduced fruit production"
    ],
    "healthy": [
      "Normal green color",
      "No visible lesions or spots",
      "Healthy growth pattern",
      "Normal fruit development"
    ]
  }

  const diseaseLower = disease.toLowerCase()
  for (const [key, symptomList] of Object.entries(symptoms)) {
    if (diseaseLower.includes(key)) {
      return symptomList
    }
  }

  return [
    "Monitor for unusual spots or lesions",
    "Check for changes in leaf color",
    "Observe plant growth patterns",
    "Look for signs of wilting or stunting"
  ]
}

// Helper function to get next steps
function getNextSteps(disease: string, confidence: number): string[] {
  if (disease.toLowerCase().includes("healthy")) {
    return [
      "Continue monitoring plants regularly",
      "Maintain current care practices",
      "Document healthy growth patterns",
      "Consider preventive measures for future"
    ]
  }

  const steps = [
    "Isolate affected plants if possible",
    "Begin treatment immediately",
    "Monitor treatment effectiveness",
    "Document response to treatment"
  ]

  if (confidence < 0.7) {
    steps.unshift("Consider getting a second opinion from agricultural expert")
  }

  if (getDiseaseSeverity(disease) === "high") {
    steps.push("Consider removing severely affected plants")
    steps.push("Plan for crop rotation next season")
  }

  return steps
} 