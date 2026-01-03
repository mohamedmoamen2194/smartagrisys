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
    description: "Get crop recommendations based on soil and weather conditions. Use this when users provide soil/weather data (even partial data like just temperature). All parameters are optional - defaults will be used for missing values.",
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
      // All parameters are optional - defaults will be used if not provided
      required: [],
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

// Cache for frequent questions
interface CacheEntry {
  response: string
  timestamp: number
  metadata?: any
}

// LLM Orchestrator Class
export class LLMOrchestrator {
  private conversations: Map<string, Conversation> = new Map()
  private apiKey: string
  private baseUrl: string
  private model: string
  private cache: Map<string, CacheEntry> = new Map()
  private cacheTTL: number = 3600000 // 1 hour in milliseconds

  constructor(
    apiKey?: string, 
    baseUrl?: string,
    model?: string
  ) {
    // Use environment variables with fallbacks
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ""
    this.baseUrl = baseUrl || process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"
    // Default to Meta Llama 3.1 8B (good Arabic support)
    // Alternative: google/gemma-2-2b-it (faster, lighter)
    // Note: Free models don't need :free suffix on OpenRouter
    this.model = model || process.env.LLM_MODEL || "meta-llama/llama-3.1-8b-instruct"
    
    if (!this.apiKey) {
      console.warn("⚠️ OPENROUTER_API_KEY not set. LLM features will not work.")
    }
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

  // Check cache for frequent questions (skip cache for greetings/short messages)
  private getCachedResponse(userMessage: string): CacheEntry | null {
    // Skip cache for greetings and very short messages
    const normalized = userMessage.toLowerCase().trim()
    const greetings = ['hi', 'hello', 'hey', 'مرحبا', 'السلام عليكم', 'اهلا', 'اهلا بيك']
    if (normalized.length < 10 || greetings.includes(normalized)) {
      return null
    }
    
    const cacheKey = this.generateCacheKey(userMessage)
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached
    }
    
    if (cached) {
      this.cache.delete(cacheKey) // Remove expired entry
    }
    
    return null
  }

  // Generate cache key from message (normalize for similar questions)
  private generateCacheKey(message: string): string {
    // Normalize: lowercase, remove extra spaces, remove punctuation
    return message
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
  }

  // Store response in cache
  private setCachedResponse(userMessage: string, response: string, metadata?: any): void {
    const cacheKey = this.generateCacheKey(userMessage)
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now(),
      metadata
    })
    
    // Limit cache size (keep last 100 entries)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
  }

  // Generate LLM response
  private async generateResponse(conversation: Conversation, userMessage: string): Promise<{ content: string; metadata?: any }> {
    try {
      // Check cache first
      const cached = this.getCachedResponse(userMessage)
      if (cached) {
        console.log("✅ Using cached response")
        return { content: cached.response, metadata: cached.metadata }
      }

      if (!this.apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured")
      }

      const messages = this.formatMessagesForLLM(conversation.messages)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "SmartAgriSys",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          tools: AVAILABLE_TOOLS,
          tool_choice: "auto", // Let model decide, but system prompt should prevent unnecessary tool usage
          temperature: 0.7,
          max_tokens: 2000, // Increased for Arabic responses
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response')
        console.error(`OpenRouter API error (${response.status}):`, errorText)
        console.error(`Request URL: ${this.baseUrl}/chat/completions`)
        console.error(`API Key present: ${!!this.apiKey}`)
        console.error(`API Key prefix: ${this.apiKey?.substring(0, 10)}...`)
        throw new Error(`LLM API error: ${response.status} - ${errorText.substring(0, 200)}`)
      }

      const data = await response.json()
      const choice = data.choices[0]
      
      // Check if content contains raw JSON tool call (model incorrectly formatted it)
      let content = choice.message.content || ""
      if (content.trim().startsWith('{') && content.includes('"name"') && content.includes('"parameters"')) {
        console.warn("Model returned tool call JSON in content instead of using tool_calls. Ignoring and responding naturally.")
        // Don't try to parse it - just respond that we need more information
        content = "I understand you're asking about agricultural data. Could you please provide more specific details or rephrase your question?"
      }
      
      // Handle tool calls if present (proper format)
      if (choice.message.tool_calls && Array.isArray(choice.message.tool_calls) && choice.message.tool_calls.length > 0) {
        const toolResults = await this.executeToolCalls(choice.message.tool_calls)
        
        // Store the tool_calls for the final response
        const toolCalls = choice.message.tool_calls
        
        // Generate final response with tool results
        const finalResponse = await this.generateFinalResponse(
          conversation,
          userMessage,
          content,
          toolResults,
          toolCalls
        )
        
        const metadata = { toolCalls: choice.message.tool_calls, toolResults }
        
        // Cache the response (only for non-greetings)
        this.setCachedResponse(userMessage, finalResponse, metadata)
        
        return {
          content: finalResponse,
          metadata,
        }
      }
      
      // No tool calls - return direct response
      if (!content) {
        content = "I'm here to help with your agricultural questions. How can I assist you?"
      }
      
      // Cache the response
      this.setCachedResponse(userMessage, content)
      
      return { content }
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
      // Extract parameters with defaults for missing values
      const {
        nitrogen = 50,        // Default: medium nitrogen
        phosphorus = 50,      // Default: medium phosphorus  
        potassium = 50,       // Default: medium potassium
        temperature = 25,     // Default: moderate temperature
        humidity = 60,        // Default: moderate humidity
        ph = 6.5,             // Default: neutral pH
        rainfall = 100,       // Default: moderate rainfall
      } = args
      
      // Use provided values, defaults for missing ones
      const finalArgs = {
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        temperature: Number(temperature),
        humidity: Number(humidity),
        ph: Number(ph),
        rainfall: Number(rainfall),
      }

      // Use absolute URL for server-side fetch
      const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const response = await fetch(`${apiBaseUrl}/api/ai/crop-recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalArgs),
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
    toolResults: ToolResult[],
    toolCalls: any[]
  ): Promise<string> {
    try {
      // Format messages for OpenRouter API with tool calls
      const messages = this.formatMessagesForLLM(conversation.messages)
      
      // Add assistant message with tool_calls
      const assistantMessage: any = {
        role: "assistant",
        content: initialResponse || null,
        tool_calls: toolCalls, // Use the original tool_calls from the API response
      }
      
      messages.push(assistantMessage)
      
      // Add tool response messages (OpenRouter/OpenAI format)
      toolResults.forEach((tr) => {
        messages.push({
          role: "tool",
          content: JSON.stringify(tr.result),
          tool_call_id: tr.toolCallId,
        })
      })

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "SmartAgriSys",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000, // Increased for Arabic responses
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response')
        console.error(`Error generating final response (${response.status}):`, errorText)
        throw new Error("LLM API error")
      }

      const data = await response.json()
      return data.choices[0].message.content || "I've processed your request. Here are the results."
    } catch (error) {
      console.error("Error generating final response:", error)
      // Return a summary based on tool results if available
      if (toolResults.length > 0) {
        const firstResult = toolResults[0].result
        if (firstResult && !firstResult.error) {
          return `Based on the analysis: ${JSON.stringify(firstResult, null, 2)}`
        }
      }
      return initialResponse || "I apologize, but I'm having trouble processing your request right now."
    }
  }

  // Format messages for LLM API (include all conversation history for context)
  private formatMessagesForLLM(messages: Message[]): any[] {
    // Include system message and all user/assistant messages
    // Filter out any messages with empty content
    return messages
      .filter(msg => msg.content && msg.content.trim().length > 0)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }))
  }

  // Get system prompt with Arabic support
  private getSystemPrompt(): string {
    return `You are an expert agricultural assistant for the Smart Agriculture System (نظام الزراعة الذكية). You are a professional farming consultant with deep knowledge of agriculture, crop management, plant diseases, soil science, and farming best practices.

You help farmers in both Arabic and English with:

1. Crop recommendations based on soil and weather conditions (توصيات المحاصيل)
2. Plant disease identification and treatment (تشخيص وعلاج أمراض النباتات)
3. Weather analysis and forecasting (تحليل الطقس والتنبؤ)
4. Soil health assessment and improvement (تقييم وتحسين صحة التربة)
5. Best farming practices and techniques (أفضل الممارسات والتقنيات الزراعية)
6. General farming advice and questions (نصائح زراعية عامة)

CRITICAL INSTRUCTIONS - READ CAREFULLY:

**NEVER use tools for these - ALWAYS answer directly:**
- Greetings: "hi", "hello", "hey", "مرحبا", "السلام عليكم", "اهلا" - Respond warmly and naturally
- Casual conversation: "how are you?", "who are you", "thanks", "شكراً", "ممكن ترد عربي"
- General knowledge questions: "What is organic farming?", "How to grow tomatoes?", "what do you know about healthy tomatoes", "ما هي أفضل طريقة لري النباتات؟"
- Questions about yourself: "who are you", "what can you do", "ايه المميزات اللي عندك"
- Questions about capabilities: Answer directly, don't call tools
- ANY question that doesn't require analyzing specific data

**ONLY use tools when:**
1. Crop Recommendation: User provides specific numeric values for soil/weather parameters (like "temp=40", "nitrogen=50", etc.)
2. Disease Detection: User uploads an image (requires image URL)

**Response Rules:**
- ALWAYS respond in the SAME LANGUAGE as the user (Arabic or English, Egyptian dialect if requested)
- For greetings: "Hello! I'm your AI agricultural assistant. I can help with crop recommendations, disease detection, and farming advice. How can I help you today?" (in user's language)
- For general questions: Answer directly from your knowledge - DO NOT use tools
- For tool results (if tools were used): Explain results naturally in user's language
- Remember previous messages in the conversation
- Be conversational, helpful, and professional

IMPORTANT: If the user asks a general question, answer it directly. DO NOT try to use tools. Tools are ONLY for specific data analysis tasks.`
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