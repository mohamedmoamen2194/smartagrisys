import { type NextRequest, NextResponse } from "next/server"

const CROP_REC_BACKEND_URL = process.env.CROP_REC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { features } = body

    if (!features || !Array.isArray(features) || features.length !== 7) {
      return NextResponse.json(
        { error: "Features array with exactly 7 values is required" },
        { status: 400 }
      )
    }

    // Forward the request to the crop recommendation FastAPI backend
    const response = await fetch(`${CROP_REC_BACKEND_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ features }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.detail || "Error from crop recommendation service" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Crop recommendation service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 