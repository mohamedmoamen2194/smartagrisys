"use client"

import { useState } from "react"

export function useServerAction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (message: string): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate contextual responses based on message content
      let response = ""

      const lowerMessage = message.toLowerCase()

      if (lowerMessage.includes("plant") || lowerMessage.includes("crop")) {
        response =
          "Based on your soil pH of 6.5 and rainfall of 120mm, I recommend planting corn or tomatoes. These crops thrive in your current conditions with moderate water requirements."
      } else if (
        lowerMessage.includes("weather") ||
        lowerMessage.includes("rain") ||
        lowerMessage.includes("temperature")
      ) {
        response =
          "Current weather conditions show adequate rainfall (120mm in the last 30 days) and an average temperature of 24°C. This is suitable for most warm-season crops including corn, tomatoes, and peppers."
      } else if (lowerMessage.includes("soil") || lowerMessage.includes("ph") || lowerMessage.includes("nutrient")) {
        response =
          "Your soil analysis shows a pH of 6.5, which is slightly acidic and ideal for most crops. Consider adding organic compost to improve soil structure and nutrient content."
      } else if (
        lowerMessage.includes("disease") ||
        lowerMessage.includes("pest") ||
        lowerMessage.includes("problem")
      ) {
        response =
          "For disease prevention, ensure proper spacing between plants for air circulation, avoid overhead watering, and consider organic fungicides if needed. Regular monitoring is key."
      } else if (lowerMessage.includes("harvest") || lowerMessage.includes("when") || lowerMessage.includes("ready")) {
        response =
          "Harvest timing depends on the crop. For tomatoes, look for color change and slight softness. For corn, check that kernels are plump and milky when punctured."
      } else if (
        lowerMessage.includes("fertilizer") ||
        lowerMessage.includes("nutrition") ||
        lowerMessage.includes("feed")
      ) {
        response =
          "Based on your soil conditions, a balanced 10-10-10 fertilizer would work well. Apply organic compost monthly and consider foliar feeding for quick nutrient uptake."
      } else {
        response =
          "I can help you with crop recommendations, soil analysis, weather conditions, disease prevention, harvest timing, and fertilization advice. What specific aspect would you like to know more about?"
      }

      return response
    } catch (err) {
      const errorMessage = "Sorry, I'm having trouble processing your request right now. Please try again."
      setError(errorMessage)
      return errorMessage
    } finally {
      setLoading(false)
    }
  }

  return { sendMessage, loading, error }
}
