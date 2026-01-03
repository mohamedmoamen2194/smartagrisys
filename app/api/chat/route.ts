import { NextRequest, NextResponse } from "next/server"

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Call Python LLM orchestrator service
    const response = await fetch(`${AI_BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId || undefined,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      console.error("Python LLM service error:", errorData)
      return NextResponse.json(
        { error: errorData.detail || "Failed to process message" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process message: " + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    // Return empty history for now (mock implementation)
    return NextResponse.json({ history: [] })
  } catch (error) {
    console.error("Chat history API error:", error)
    return NextResponse.json(
      { error: "Failed to get conversation history" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    // Mock clear conversation (no actual storage to clear)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Clear conversation API error:", error)
    return NextResponse.json(
      { error: "Failed to clear conversation" },
      { status: 500 }
    )
  }
} 