import { NextRequest, NextResponse } from "next/server"
import { LLMOrchestrator } from "@/lib/llm-orchestrator"

// Initialize the LLM orchestrator
const orchestrator = new LLMOrchestrator(
  process.env.OPENAI_API_KEY || "",
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
)

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Generate conversation ID if not provided
    const finalConversationId = conversationId || `conv-${Date.now()}`

    // Process the message through the LLM orchestrator
    const response = await orchestrator.processMessage(finalConversationId, message)

    return NextResponse.json({
      message: response,
      conversationId: finalConversationId,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
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

    // Get conversation history
    const history = await orchestrator.getConversationHistory(conversationId)

    return NextResponse.json({ history })
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

    // Clear conversation
    await orchestrator.clearConversation(conversationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Clear conversation API error:", error)
    return NextResponse.json(
      { error: "Failed to clear conversation" },
      { status: 500 }
    )
  }
} 