"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Send, Bot, User, Image, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  metadata?: {
    selectedModel?: any
    confidence?: number
    executionTime?: number
    hasImage?: boolean
  }
}

interface MCBChatInterfaceProps {
  userId: string
  userType: 'farmer' | 'customer'
  onModelSelected?: (model: any) => void
}

export default function MCBChatInterface({ userId, userType, onModelSelected }: MCBChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your AI assistant. I can help you with plant disease detection, crop recommendations, and more. Just describe your question or upload an image!",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [isImageUploadInProgress, setIsImageUploadInProgress] = useState(false)  // ← NEW FLAG
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return

    const userMessage = addMessage({
      type: 'user',
      content: inputMessage || 'Image uploaded',
      metadata: { hasImage: !!selectedImage }
    })

    setIsLoading(true)
    setInputMessage('')

    try {
      let response
      const wasImageUpload = !!selectedImage  // Remember if this was an image upload
      
      if (selectedImage) {
        setIsImageUploadInProgress(true)  // ← SET FLAG
        // Send message with image
        const formData = new FormData()
        formData.append('action', 'analyze-with-image')
        formData.append('message', inputMessage || 'What can you tell me about this image?')
        formData.append('user_id', userId)
        formData.append('user_type', userType)
        if (sessionId) formData.append('session_id', sessionId)
        formData.append('file', selectedImage)

        response = await fetch('/api/mcb', {
          method: 'POST',
          body: formData
        })
      } else {
        // Send text-only message
        response = await fetch('/api/mcb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'analyze',
            message: inputMessage,
            user_id: userId,
            user_type: userType,
            session_id: sessionId
          })
        })
      }

      if (!response.ok) {
        throw new Error('Failed to get response from MCB')
      }

      const mcbResult = await response.json()
      
      console.log('=== FRONTEND RESPONSE DEBUG ===')
      console.log('Full mcbResult:', JSON.stringify(mcbResult, null, 2))
      console.log('mcbResult.response length:', mcbResult.response?.length || 'undefined')
      console.log('mcbResult.response preview:', mcbResult.response?.substring(0, 100) || 'undefined')
      console.log('mcbResult.image_processed:', mcbResult.image_processed)
      console.log('mcbResult.source:', mcbResult.source)
      
      // CRITICAL: Check if this is actually the disease detection response
      if (mcbResult.image_processed && mcbResult.response && 
          !mcbResult.response.includes("Hello! I'm your AI-powered agricultural assistant")) {
        console.log('✅ RECEIVED ACTUAL DISEASE DETECTION RESPONSE!')
      } else {
        console.log('❌ RECEIVED GENERIC/FALLBACK RESPONSE')
        console.log('Response contains generic help:', mcbResult.response?.includes("Hello! I'm your AI-powered agricultural assistant"))
      }
      
      if (mcbResult.error) {
        throw new Error(mcbResult.error)
      }

      // Update session ID
      if (mcbResult.session_id) {
        setSessionId(mcbResult.session_id)
      }

      // Create bot response
      let botContent = generateBotResponse(mcbResult)
      
      console.log('=== BOT CONTENT DEBUG ===')
      console.log('Generated bot content length:', botContent.length)
      console.log('Generated bot content preview:', botContent.substring(0, 200))
      console.log('Bot content contains disease detection:', botContent.includes('DISEASE') || botContent.includes('Bacterial Spot'))
      console.log('Bot content contains generic help:', botContent.includes("Hello! I'm your AI-powered agricultural assistant"))
      
      const botMessage = addMessage({
        type: 'bot',
        content: botContent,
        metadata: {
          selectedModel: mcbResult.selected_model,
          confidence: mcbResult.confidence,
          executionTime: mcbResult.execution_time_ms
        }
      })
      
      console.log('Bot message added to chat:', {
        contentLength: botContent.length,
        hasMetadata: !!botMessage.metadata,
        modelName: botMessage.metadata?.selectedModel?.name,
        messageId: botMessage.id
      })
      
      // Check if this is the disease detection response we expect
      if (botContent.includes('DISEASE') && !botContent.includes("Hello! I'm your AI-powered agricultural assistant")) {
        console.log('🎉 SUCCESS: Disease detection response correctly added to chat!')
      } else {
        console.log('❌ FAILURE: Wrong response added to chat')
      }

      // Notify parent component about model selection
      if (onModelSelected && mcbResult.selected_model) {
        onModelSelected(mcbResult.selected_model)
      }

      // If model can execute immediately and user seems to want results
      // CRITICAL: NEVER auto-execute for image uploads since they already execute the model
      if (wasImageUpload) {
        console.log('⏭️ FORCE SKIPPING auto-execution because this was an image upload')
      } else if (mcbResult.can_execute && shouldAutoExecute(inputMessage) && 
                 mcbResult.selected_model?.type !== 'crop_recommendation') {
        console.log('🚀 Auto-executing model for text query...')
        await executeModel(mcbResult.selected_model.model_id, mcbResult.session_id)
      } else {
        console.log('⏭️ Skipping auto-execution', { 
          wasImageUpload, 
          can_execute: mcbResult.can_execute,
          shouldAutoExecute: shouldAutoExecute(inputMessage),
          modelType: mcbResult.selected_model?.type
        })
      }

    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        type: 'bot',
        content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      })
      toast.error('Failed to process your message')
    } finally {
      setIsLoading(false)
      setSelectedImage(null)
      setIsImageUploadInProgress(false)  // ← CLEAR FLAG
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const executeModel = async (modelId: string, sessionId: string) => {
    console.log('🚫 EXECUTE MODEL CALLED - Checking if should proceed...')
    console.trace('🚫 EXECUTE MODEL CALL STACK:')

    // CRITICAL: Prevent execution for image uploads since they already execute the model
    if (isImageUploadInProgress) {
      console.log('🚫 BLOCKING executeModel - image upload in progress!')
      return
    }

    console.log('✅ Proceeding with executeModel for text query')
    setIsLoading(true)

    try {
      console.log('🔍 EXECUTE MODEL: Sending request with:', {
        action: 'execute',
        model_id: modelId,
        session_id: sessionId,
        inputs: {}
      })

      const response = await fetch('/api/mcb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'execute',
          model_id: modelId,
          session_id: sessionId,
          inputs: {}
        })
      })

      console.log('🔍 EXECUTE MODEL: Response status:', response.status)

      if (!response.ok) {
        throw new Error('Failed to execute model')
      }

      const result = await response.json()
      console.log('🔍 EXECUTE MODEL: Received result:', result)

      if (result.error) {
        throw new Error(result.error)
      }

      const botContent = generateExecutionResponse(result)

      console.log('📝 EXECUTE MODEL: Adding bot message from executeModel')
      console.log('📝 EXECUTE MODEL: Bot content preview:', botContent.substring(0, 100))

      addMessage({
        type: 'bot',
        content: botContent,
        metadata: {
          executionTime: result.execution_time_ms
        }
      })

    } catch (error) {
      console.error('Error executing model:', error)
      addMessage({
        type: 'bot',
        content: `❌ Failed to execute the analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateBotResponse = (mcbResult: any): string => {
    console.log('🔍 GENERATE BOT RESPONSE INPUT:', {
      image_processed: mcbResult.image_processed,
      response_length: mcbResult.response?.length,
      response_preview: mcbResult.response?.substring(0, 100),
      source: mcbResult.source,
      selected_model: mcbResult.selected_model?.name
    })
    
    // For image analysis, the response is already formatted by the MCB backend
    if (mcbResult.image_processed) {
      console.log('🎯 Using pre-formatted image analysis response')
      return mcbResult.response
    }

    // FIX: For text queries, also use the MCB backend response directly
    if (mcbResult.response && mcbResult.source === 'real_mcb_backend') {
      console.log('🎯 Using MCB backend response for text query')
      return mcbResult.response
    }

    // Fallback to generic response formatting only if no MCB response
    console.log('📝 Using fallback text query response formatting')
    const model = mcbResult.selected_model
    const confidence = mcbResult.confidence
    const reasoning = mcbResult.reasoning
    const requiredInputs = mcbResult.required_inputs

    let response = `🤖 **Analysis Complete**\n\n`
    response += `${reasoning}\n\n`

    if (requiredInputs && Object.keys(requiredInputs).length > 0) {
      response += `**Required Information:**\n`
      Object.entries(requiredInputs).forEach(([key, info]: [string, any]) => {
        if (info.type === 'file') {
          response += `📷 ${info.description}\n`
        } else if (info.type === 'form') {
          response += `📋 ${info.description}\n`
          if (info.fields) {
            Object.entries(info.fields).forEach(([field, desc]) => {
              response += `   • ${desc}\n`
            })
          }
        }
      })
      response += `\nPlease provide the required information and I'll run the analysis!`
    } else {
      response += `✅ I have all the information needed. Let me run the analysis for you...`
    }

    return response
  }

  const generateExecutionResponse = (result: any): string => {
    const modelResult = result.result
    const modelUsed = result.model_used
    const executionTime = result.execution_time_ms

    if (modelResult.disease) {
      // Disease detection result
      const disease = modelResult.disease.replace(/_/g, ' ')
      const confidence = modelResult.confidence
      const treatments = modelResult.treatment_recommendations || []
      const severity = modelResult.severity

      let response = `🔍 **Disease Analysis Results**\n\n`
      response += `**Disease Detected:** ${disease}\n`
      response += `**Confidence:** ${(confidence * 100).toFixed(1)}%\n`
      response += `**Severity:** ${severity}\n\n`

      if (treatments.length > 0) {
        response += `**Treatment Recommendations:**\n`
        treatments.forEach((treatment: string, index: number) => {
          response += `${index + 1}. ${treatment}\n`
        })
      }

      response += `\n*Analysis completed in ${executionTime}ms using ${modelUsed}*`
      return response
    }

    if (modelResult.crop) {
      // Crop recommendation result
      const crop = modelResult.crop
      const soilRecs = modelResult.soil_recommendations || []
      const plantingTips = modelResult.planting_recommendations || []

      let response = `🌱 **Crop Recommendation Results**\n\n`
      response += `**Recommended Crop:** ${crop.charAt(0).toUpperCase() + crop.slice(1)}\n\n`

      if (soilRecs.length > 0) {
        response += `**Soil Recommendations:**\n`
        soilRecs.forEach((rec: string) => {
          response += `• ${rec}\n`
        })
        response += `\n`
      }

      if (plantingTips.length > 0) {
        response += `**Planting Tips:**\n`
        plantingTips.forEach((tip: string) => {
          response += `• ${tip}\n`
        })
      }

      response += `\n*Analysis completed in ${executionTime}ms using ${modelUsed}*`
      return response
    }

    // Generic result
    return `✅ **Analysis Complete**\n\n${JSON.stringify(modelResult, null, 2)}\n\n*Completed in ${executionTime}ms using ${modelUsed}*`
  }

  const shouldAutoExecute = (message: string): boolean => {
    // Disable auto-execution since MCB backend already executes models
    console.log('🚫 Auto-execution disabled - MCB backend handles execution')
    return false
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size must be less than 10MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      setSelectedImage(file)
      toast.success('Image selected successfully')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Smart Agriculture AI Assistant
          <Badge variant="secondary" className="ml-auto">MCB Powered</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                
                <div className={`p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 border'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  
                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs opacity-70">
                      <div className="flex items-center gap-2 flex-wrap">
                        {message.metadata.selectedModel && (
                          <Badge variant="outline" className="text-xs">
                            {message.metadata.selectedModel.name}
                          </Badge>
                        )}
                        {message.metadata.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {(message.metadata.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        )}
                        {message.metadata.executionTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {message.metadata.executionTime}ms
                          </span>
                        )}
                        {message.metadata.hasImage && (
                          <span className="flex items-center gap-1">
                            <Image className="h-3 w-3" />
                            Image
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          {selectedImage && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Image className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(1)}MB)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedImage(null)}
                className="ml-auto h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="h-4 w-4" />
            </Button>
            
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about plant diseases, crop recommendations, or upload an image..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
