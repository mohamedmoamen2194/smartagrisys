import { type NextRequest, NextResponse } from "next/server"

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get the model type from the URL
    const url = new URL(request.url)
    const modelType = url.searchParams.get("modelType")

    if (!modelType) {
      return NextResponse.json({ error: "Model type is required" }, { status: 400 })
    }

    // Forward the request to the Python backend
    const response = await fetch(`${AI_BACKEND_URL}/api/predict/${modelType}`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.detail || "Error from AI service" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("AI service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
