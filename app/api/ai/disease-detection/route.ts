import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DISEASE_DET_BACKEND_URL = process.env.DISEASE_DET_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 })
    }

    // Forward the image to the FastAPI backend
    const backendForm = new FormData()
    backendForm.append("file", file, file.name)

    const response = await fetch(`${DISEASE_DET_BACKEND_URL}/predict`, {
      method: "POST",
      body: backendForm as any, // Next.js types limitation
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.detail || "Error from disease detection service" }, { status: response.status })
    }

    const data = await response.json()

    // TEMP: Hardcode a farmerId for now
    

    return NextResponse.json(data)
  } catch (error) {
    console.error("Disease detection service error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 