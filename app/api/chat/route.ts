import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Generate conversation ID if not provided
    const finalConversationId = conversationId || `conv-${Date.now()}`

    // Use our MCB API for processing
    const mcbResponse = await fetch(`${request.nextUrl.origin}/api/mcb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'chat',
        message: message,
        user_type: 'farmer',
        user_id: userId || 'user_' + Date.now(),
        session_id: finalConversationId
      })
    })

    if (!mcbResponse.ok) {
      throw new Error('MCB API failed')
    }

    const mcbData = await mcbResponse.json()
    
    // Extract the response from MCB format
    const responseContent = mcbData.result?.response || mcbData.analysis?.response || "I'm here to help with your agricultural questions!"

    return NextResponse.json({
      message: {
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      },
      conversationId: finalConversationId,
    })
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