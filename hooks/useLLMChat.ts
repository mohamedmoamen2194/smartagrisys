"use client"

import { useState, useCallback } from "react"
import { Message } from "@/lib/llm-orchestrator"

export function useLLMChat() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send message")
      }

      const data = await response.json()
      
      // Set conversation ID if it's the first message
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId)
      }

      return data.message.content
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message"
      setError(errorMessage)
      return `I apologize, but I'm having trouble processing your request: ${errorMessage}`
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const getConversationHistory = useCallback(async (): Promise<Message[]> => {
    if (!conversationId) return []

    try {
      const response = await fetch(`/api/chat?conversationId=${conversationId}`)
      
      if (!response.ok) {
        throw new Error("Failed to get conversation history")
      }

      const data = await response.json()
      return data.history || []
    } catch (err) {
      console.error("Error getting conversation history:", err)
      return []
    }
  }, [conversationId])

  const clearConversation = useCallback(async (): Promise<void> => {
    if (!conversationId) return

    try {
      await fetch(`/api/chat?conversationId=${conversationId}`, {
        method: "DELETE",
      })
      setConversationId(null)
    } catch (err) {
      console.error("Error clearing conversation:", err)
    }
  }, [conversationId])

  return {
    sendMessage,
    getConversationHistory,
    clearConversation,
    loading,
    error,
    conversationId,
  }
} 