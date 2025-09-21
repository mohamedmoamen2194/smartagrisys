"use client"

import { useState, useCallback } from "react"

export interface MCBMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  metadata?: {
    model_used?: string
    confidence?: number
    execution_time?: number
    model_type?: string
    requires_input?: boolean
  }
}

export interface MCBAnalysis {
  selected_model: {
    model_id: string
    name: string
    type: string
    description: string
  }
  confidence: number
  reasoning: string
  required_inputs?: Record<string, any>
}

export function useMCBChat() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [lastAnalysis, setLastAnalysis] = useState<MCBAnalysis | null>(null)

  const sendMessage = useCallback(async (
    message: string,
    userType: 'farmer' | 'customer' = 'farmer',
    additionalContext?: {
      location?: string
      cropTypes?: string[]
      farmSize?: number
    }
  ): Promise<{ content: string; analysis?: MCBAnalysis }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat/mcb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationId,
          userId: `user-${Date.now()}`,
          userType,
          ...additionalContext
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

      // Store the MCB analysis
      if (data.mcb_analysis) {
        setLastAnalysis(data.mcb_analysis)
      }

      return {
        content: data.message.content,
        analysis: data.mcb_analysis
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message"
      setError(errorMessage)
      return {
        content: `I apologize, but I'm having trouble processing your request: ${errorMessage}`
      }
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const sendMessageWithImage = useCallback(async (
    message: string,
    imageFile: File,
    userType: 'farmer' | 'customer' = 'farmer'
  ): Promise<{ content: string; analysis?: MCBAnalysis }> => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('action', 'analyze-with-image')
      formData.append('message', message)
      formData.append('user_id', `user-${Date.now()}`)
      formData.append('user_type', userType)
      if (conversationId) formData.append('session_id', conversationId)
      formData.append('file', imageFile)

      // First, analyze with MCB
      const mcbResponse = await fetch('/api/mcb', {
        method: 'POST',
        body: formData
      })

      if (!mcbResponse.ok) {
        throw new Error('Failed to analyze image with MCB')
      }

      const mcbResult = await mcbResponse.json()

      // Set conversation ID
      if (!conversationId && mcbResult.session_id) {
        setConversationId(mcbResult.session_id)
      }

      // Always try to execute for image analysis
      if (mcbResult.selected_model.type === 'disease_detection') {
        try {
          // Convert image to base64 for execution
          const imageBase64 = await fileToBase64(imageFile)
          
          const executionResponse = await fetch('/api/mcb', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'execute',
              model_id: mcbResult.selected_model.model_id,
              session_id: mcbResult.session_id,
              inputs: { image: imageBase64 }
            }),
          })

          if (executionResponse.ok) {
            const executionResult = await executionResponse.json()
            const formattedResponse = formatImageAnalysisResult(executionResult, mcbResult.selected_model)
            
            return {
              content: formattedResponse,
              analysis: {
                selected_model: mcbResult.selected_model,
                confidence: mcbResult.confidence,
                reasoning: mcbResult.reasoning
              }
            }
          } else {
            const errorText = await executionResponse.text()
            console.error('Model execution failed:', errorText)
          }
        } catch (executionError) {
          console.error('Error executing model:', executionError)
        }
      }

      // Return analysis response
      const analysisResponse = `🤖 **Image Analysis**\n\n${mcbResult.reasoning}\n\nI've selected the ${mcbResult.selected_model.name} for your image. Let me analyze it...`

      return {
        content: analysisResponse,
        analysis: {
          selected_model: mcbResult.selected_model,
          confidence: mcbResult.confidence,
          reasoning: mcbResult.reasoning,
          required_inputs: mcbResult.required_inputs
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process image"
      setError(errorMessage)
      return {
        content: `I apologize, but I'm having trouble analyzing your image: ${errorMessage}`
      }
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const getConversationHistory = useCallback(async (): Promise<MCBMessage[]> => {
    if (!conversationId) return []

    try {
      const response = await fetch(`/api/chat/mcb?conversationId=${conversationId}`)
      
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
      await fetch(`/api/chat/mcb?conversationId=${conversationId}`, {
        method: "DELETE",
      })
      setConversationId(null)
      setLastAnalysis(null)
    } catch (err) {
      console.error("Error clearing conversation:", err)
    }
  }, [conversationId])

  return {
    sendMessage,
    sendMessageWithImage,
    getConversationHistory,
    clearConversation,
    loading,
    error,
    conversationId,
    lastAnalysis,
  }
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

function formatImageAnalysisResult(executionResult: any, selectedModel: any): string {
  const result = executionResult.result
  const modelName = selectedModel.name
  const executionTime = executionResult.execution_time_ms

  if (result.disease) {
    const disease = result.disease.replace(/_/g, ' ')
    const confidence = result.confidence || 0
    const treatments = result.treatment_recommendations || []
    const severity = result.severity || 'UNKNOWN'

    let response = `🔍 **Disease Analysis from Image**\n\n`
    response += `**Disease Detected:** ${disease}\n`
    response += `**Confidence:** ${(confidence * 100).toFixed(1)}%\n`
    response += `**Severity:** ${severity}\n\n`

    if (treatments.length > 0) {
      response += `**Treatment Recommendations:**\n`
      treatments.forEach((treatment: string, index: number) => {
        response += `${index + 1}. ${treatment}\n`
      })
    }

    response += `\n*Image analysis completed in ${executionTime}ms using ${modelName}*`
    return response
  }

  return `✅ **Image Analysis Complete**\n\n${JSON.stringify(result, null, 2)}\n\n*Completed in ${executionTime}ms using ${modelName}*`
}
