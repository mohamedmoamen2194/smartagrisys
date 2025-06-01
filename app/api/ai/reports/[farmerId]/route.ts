import { type NextRequest, NextResponse } from "next/server"

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8000"

export async function GET(request: NextRequest, { params }: { params: { farmerId: string } }) {
  try {
    const { farmerId } = params

    const response = await fetch(`${AI_BACKEND_URL}/api/reports/${farmerId}`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.detail || "Error fetching reports" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
