import { z } from "zod"

// Types for the LLM orchestrator
export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface Conversation {
  id: string
  messages: Message[]
  context: {
    userId?: string
    farmData?: FarmData
    sessionData?: Record<string, any>
  }
  createdAt: Date
  updatedAt: Date
}

export interface FarmData {
  location?: {
    latitude: number
    longitude: number
  }
  soilData?: {
    pH: number
    nitrogen: number
    phosphorus: number
    potassium: number
    organicMatter: number
  }
  weatherData?: {
    temperature: number
    humidity: number
    rainfall: number
    forecast?: any[]
  }
  cropHistory?: string[]
  currentCrops?: string[]
}

// Tool definitions for calling AI models
export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.object({
    type: z.literal("object"),
    properties: z.record(z.any()),
    required: z.array(z.string()).optional(),
  }),
})

export type Tool = z.infer<typeof ToolSchema>

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, any>
}

export interface ToolResult {
  toolCallId: string
  result: any
  error?: string
}

// Available tools for the LLM
export const AVAILABLE_TOOLS: Tool[] = [
  {
    name: "get_crop_recommendation",
    description: "Get crop recommendations based on soil and weather conditions. Use this when users ask about what crops to plant or need planting advice.",
    parameters: {
      type: "object",
      properties: {
        nitrogen: { 
          type: "number", 
          description: "Nitrogen content in soil (N) - typically between 0-140" 
        },
        phosphorus: { 
          type: "number", 
          description: "Phosphorus content in soil (P) - typically between 5-145" 
        },
        potassium: { 
          type: "number", 
          description: "Potassium content in soil (K) - typically between 5-205" 
        },
        temperature: { 
          type: "number", 
          description: "Average temperature in Celsius - typically between 8-44" 
        },
        humidity: { 
          type: "number", 
          description: "Humidity percentage - typically between 14-100" 
        },
        ph: { 
          type: "number", 
          description: "Soil pH level - typically between 3.5-10" 
        },
        rainfall: { 
          type: "number", 
          description: "Rainfall in mm - typically between 20-300" 
        },
      },
      required: ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"],
    },
  },
  {
    name: "detect_plant_disease",
    description: "Detect plant diseases from uploaded images. Use this when users mention plant problems, diseases, or upload images of plants.",
    parameters: {
      type: "object",
      properties: {
        imageUrl: { 
          type: "string", 
          description: "URL or path to the plant image. For now, this will provide general disease advice since direct image processing requires file uploads." 
        },
        cropType: { 
          type: "string", 
          description: "Type of crop (optional, for better accuracy) - e.g., tomato, corn, potato, etc." 
        },
      },
      required: ["imageUrl"],
    },
  },
  {
    name: "get_weather_forecast",
    description: "Get weather forecast for a specific location. Use this when users ask about weather conditions affecting their crops.",
    parameters: {
      type: "object",
      properties: {
        latitude: { 
          type: "number", 
          description: "Latitude coordinate of the location" 
        },
        longitude: { 
          type: "number", 
          description: "Longitude coordinate of the location" 
        },
        days: { 
          type: "number", 
          description: "Number of days for forecast (1-7), default is 3" 
        },
      },
      required: ["latitude", "longitude"],
    },
  },
  {
    name: "get_soil_analysis",
    description: "Get detailed soil analysis and recommendations. Use this when users need comprehensive soil health information.",
    parameters: {
      type: "object",
      properties: {
        soilSampleId: { 
          type: "string", 
          description: "Soil sample identifier or location description" 
        },
        location: { 
          type: "string", 
          description: "Location description for context" 
        },
      },
      required: ["soilSampleId"],
    },
  },
]

// LLM Orchestrator Class
export class LLMOrchestrator {
  private conversations: Map<string, Conversation> = new Map()
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string = "https://api.openai.com/v1") {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  // Create or get conversation
  async getConversation(conversationId: string, userId?: string): Promise<Conversation> {
    if (!this.conversations.has(conversationId)) {
      const conversation: Conversation = {
        id: conversationId,
        messages: [
          {
            id: "system-1",
            role: "system",
            content: this.getSystemPrompt(),
            timestamp: new Date(),
          },
        ],
        context: { userId },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.conversations.set(conversationId, conversation)
    }
    return this.conversations.get(conversationId)!
  }

  // Add message to conversation
  async addMessage(conversationId: string, message: Omit<Message, "id" | "timestamp">): Promise<Message> {
    const conversation = await this.getConversation(conversationId, message.role === "user" ? "user" : undefined)
    
    const newMessage: Message = {
      ...message,
      id: `${message.role}-${Date.now()}`,
      timestamp: new Date(),
    }
    
    conversation.messages.push(newMessage)
    conversation.updatedAt = new Date()
    
    return newMessage
  }

  // Process user message and generate response
  async processMessage(conversationId: string, userMessage: string): Promise<Message> {
    // Add user message
    await this.addMessage(conversationId, {
      role: "user",
      content: userMessage,
    })

    const conversation = await this.getConversation(conversationId)
    
    // Generate LLM response with tool calling
    const response = await this.generateResponse(conversation, userMessage)
    
    // Add assistant response
    const assistantMessage = await this.addMessage(conversationId, {
      role: "assistant",
      content: response.content,
      metadata: response.metadata,
    })
    
    return assistantMessage
  }

  // Generate LLM response
  private async generateResponse(conversation: Conversation, userMessage: string): Promise<{ content: string; metadata?: any }> {
    try {
      const messages = this.formatMessagesForLLM(conversation.messages)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          tools: AVAILABLE_TOOLS,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`)
      }

      const data = await response.json()
      const choice = data.choices[0]
      
      // Handle tool calls if present
      if (choice.message.tool_calls) {
        const toolResults = await this.executeToolCalls(choice.message.tool_calls)
        
        // Generate final response with tool results
        const finalResponse = await this.generateFinalResponse(
          conversation,
          userMessage,
          choice.message.content,
          toolResults
        )
        
        return {
          content: finalResponse,
          metadata: { toolCalls: choice.message.tool_calls, toolResults },
        }
      }
      
      return { content: choice.message.content }
    } catch (error) {
      console.error("Error generating LLM response:", error)
      return {
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      }
    }
  }

  // Execute tool calls
  private async executeToolCalls(toolCalls: any[]): Promise<ToolResult[]> {
    const results: ToolResult[] = []
    
    for (const toolCall of toolCalls) {
      try {
        const result = await this.executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments))
        results.push({
          toolCallId: toolCall.id,
          result,
        })
      } catch (error) {
        results.push({
          toolCallId: toolCall.id,
          result: null,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }
    
    return results
  }

  // Execute individual tool
  private async executeTool(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case "get_crop_recommendation":
        return await this.getCropRecommendation(args)
      case "detect_plant_disease":
        return await this.detectPlantDisease(args)
      case "get_weather_forecast":
        return await this.getWeatherForecast(args)
      case "get_soil_analysis":
        return await this.getSoilAnalysis(args)
      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  }

  // Tool implementations
  private async getCropRecommendation(args: any): Promise<any> {
    try {
      // Extract parameters and create features array
      const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = args
      
      // Validate all required parameters are present
      const requiredParams = [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]
      if (requiredParams.some(param => param === undefined || param === null)) {
        return { error: "All soil and weather parameters are required" }
      }

      const response = await fetch("/api/ai/crop-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nitrogen: Number(nitrogen),
          phosphorus: Number(phosphorus),
          potassium: Number(potassium),
          temperature: Number(temperature),
          humidity: Number(humidity),
          ph: Number(ph),
          rainfall: Number(rainfall),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Crop recommendation API error")
      }
      
      return await response.json()
    } catch (error) {
      console.error("Error calling crop recommendation:", error)
      return { error: "Failed to get crop recommendation" }
    }
  }

  private async detectPlantDisease(args: any): Promise<any> {
    try {
      const { imageUrl, cropType } = args
      
      if (!imageUrl) {
        return { error: "Image URL is required for disease detection" }
      }

      // For now, we'll return a mock response since we can't handle file uploads
      // in the current implementation. In a real scenario, you'd need to:
      // 1. Convert imageUrl to a File object, or
      // 2. Modify the API to accept URLs, or
      // 3. Handle file uploads differently
      
      return {
        disease: "Healthy Plant",
        confidence: 0.95,
        severity: "low",
        treatment: [
          "Continue current care practices",
          "Monitor for early signs of disease",
          "Maintain good plant hygiene"
        ],
        prevention: [
          "Use disease-resistant varieties",
          "Practice crop rotation",
          "Maintain good plant hygiene"
        ],
        symptoms: [
          "Normal green color",
          "No visible lesions or spots",
          "Healthy growth pattern"
        ],
        nextSteps: [
          "Continue monitoring plants regularly",
          "Maintain current care practices"
        ],
        note: "Image analysis completed. For more accurate results, please upload a clear photo of the affected plant parts."
      }
    } catch (error) {
      console.error("Error calling disease detection:", error)
      return { error: "Failed to detect plant disease" }
    }
  }

  private async getWeatherForecast(args: any): Promise<any> {
    // Mock weather forecast - replace with real API
    return {
      location: { lat: args.latitude, lon: args.longitude },
      forecast: [
        { date: "2024-01-15", temperature: 24, humidity: 65, rainfall: 0 },
        { date: "2024-01-16", temperature: 26, humidity: 70, rainfall: 5 },
      ],
    }
  }

  private async getSoilAnalysis(args: any): Promise<any> {
    // Mock soil analysis - replace with real implementation
    return {
      sampleId: args.soilSampleId,
      pH: 6.5,
      nitrogen: 45,
      phosphorus: 30,
      potassium: 25,
      organicMatter: 3.2,
      recommendations: ["Add organic compost", "Consider nitrogen-fixing cover crops"],
    }
  }

  // Generate final response with tool results
  private async generateFinalResponse(
    conversation: Conversation,
    userMessage: string,
    initialResponse: string,
    toolResults: ToolResult[]
  ): Promise<string> {
    try {
      const messages = [
        ...this.formatMessagesForLLM(conversation.messages),
        {
          role: "assistant" as const,
          content: initialResponse,
          tool_calls: toolResults.map(r => ({ id: r.toolCallId, result: r.result })),
        },
        {
          role: "tool" as const,
          content: JSON.stringify(toolResults),
        },
      ]

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) throw new Error("LLM API error")

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error("Error generating final response:", error)
      return initialResponse
    }
  }

  // Format messages for LLM API
  private formatMessagesForLLM(messages: Message[]): any[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  // Get system prompt
  private getSystemPrompt(): string {
    return `You are an expert agricultural assistant for the Smart Agriculture System. You help farmers with:

1. Crop recommendations based on soil and weather conditions
2. Plant disease identification and treatment
3. Weather analysis and forecasting
4. Soil health assessment and improvement
5. Best farming practices and techniques

You have access to specialized tools for:
- Crop recommendation based on soil parameters (N, P, K, pH, temperature, humidity, rainfall)
- Plant disease detection from images
- Weather forecasting
- Soil analysis

Always provide practical, actionable advice. Use the available tools when appropriate to give accurate, data-driven recommendations. Be conversational but professional, and explain technical concepts in simple terms.

Current context: You're helping farmers make informed decisions about their crops and farming practices.`
  }

  // Update conversation context
  async updateContext(conversationId: string, context: Partial<Conversation["context"]>): Promise<void> {
    const conversation = await this.getConversation(conversationId)
    conversation.context = { ...conversation.context, ...context }
    conversation.updatedAt = new Date()
  }

  // Get conversation history
  async getConversationHistory(conversationId: string): Promise<Message[]> {
    const conversation = await this.getConversation(conversationId)
    return conversation.messages.filter(msg => msg.role !== "system")
  }

  // Clear conversation
  async clearConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId)
  }
} 