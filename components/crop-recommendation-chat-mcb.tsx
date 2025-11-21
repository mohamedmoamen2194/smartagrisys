"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CloudRain, Send, User, RefreshCw, Upload, Image, Bot, Zap } from "lucide-react"
import { useMCBChat, MCBMessage } from "../hooks/useMCBChat"
import { toast } from "sonner"

interface CropRecommendationChatMCBProps {
  userType?: 'farmer' | 'customer'
  userContext?: {
    location?: string
    cropTypes?: string[]
    farmSize?: number
  }
}

export function CropRecommendationChatMCB({ 
  userType = 'farmer', 
  userContext 
}: CropRecommendationChatMCBProps) {
  const [input, setInput] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [messages, setMessages] = useState<MCBMessage[]>([
    {
      id: "1",
      content: "Hello! I'm your AI-powered agricultural assistant with intelligent model selection. I can help you with:\n\n🔍 **Disease Detection** - Upload plant images for diagnosis\n🌱 **Crop Recommendations** - Get optimal crop suggestions\n📊 **Smart Analysis** - I automatically choose the best AI model for your question\n\nWhat would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  
  const { sendMessage, sendMessageWithImage, loading, error, clearConversation, lastAnalysis } = useMCBChat()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return

    // Add user message
    const userMessage: MCBMessage = {
      id: Date.now().toString(),
      content: selectedImage ? `${input || 'Image uploaded'} 📷` : input,
      role: "user",
      timestamp: new Date(),
      metadata: {
        requires_input: false
      }
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")

    try {
      let response
      
      if (selectedImage) {
        // Send message with image
        response = await sendMessageWithImage(currentInput || "What can you tell me about this image?", selectedImage, userType)
        setSelectedImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        // Send text message
        response = await sendMessage(currentInput, userType, userContext)
      }

      const aiMessage: MCBMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: "assistant",
        timestamp: new Date(),
        metadata: response.analysis ? {
          model_used: response.analysis.selected_model.name,
          confidence: response.analysis.confidence,
          model_type: response.analysis.selected_model.type
        } : undefined
      }

      setMessages((prev) => [...prev, aiMessage])

      // Show success toast with model info
      if (response.analysis) {
        toast.success(`Analysis complete using ${response.analysis.selected_model.name} (${(response.analysis.confidence * 100).toFixed(0)}% confidence)`)
      }

    } catch (err) {
      console.error('Error sending message:', err)
      const errorMessage: MCBMessage = {
        id: (Date.now() + 2).toString(),
        content: `❌ Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error('Failed to process your message')
    }
  }

  const handleClearConversation = async () => {
    await clearConversation()
    setMessages([
      {
        id: "1",
        content: "Hello! I'm your AI-powered agricultural assistant with intelligent model selection. I can help you with:\n\n🔍 **Disease Detection** - Upload plant images for diagnosis\n🌱 **Crop Recommendations** - Get optimal crop suggestions\n📊 **Smart Analysis** - I automatically choose the best AI model for your question\n\nWhat would you like to know?",
        role: "assistant",
        timestamp: new Date(),
      },
    ])
    toast.success('Conversation cleared')
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
      handleSend()
    }
  }

  const getModelTypeIcon = (modelType?: string) => {
    switch (modelType) {
      case 'disease_detection':
        return <Bot className="h-3 w-3" />
      case 'crop_recommendation':
        return <CloudRain className="h-3 w-3" />
      default:
        return <Zap className="h-3 w-3" />
    }
  }

  const getModelTypeColor = (modelType?: string) => {
    switch (modelType) {
      case 'disease_detection':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'crop_recommendation':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] border rounded-md bg-white dark:bg-gray-900">
      <div className="border-b p-3 sm:p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-t-md">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base truncate">AI Agricultural Assistant</h3>
          <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
            <Zap className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
          <Badge variant="secondary" className="text-xs sm:hidden">
            <Zap className="h-3 w-3" />
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearConversation}
          title="Clear conversation"
          disabled={loading}
          className="ml-2 flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-2 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                  {message.role === "user" ? (
                    <>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 min-w-0 ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  
                  {/* Metadata */}
                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 opacity-75">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-xs">
                        {message.metadata.model_used && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getModelTypeColor(message.metadata.model_type)}`}
                          >
                            {getModelTypeIcon(message.metadata.model_type)}
                            <span className="ml-1 hidden sm:inline">{message.metadata.model_used}</span>
                          </Badge>
                        )}
                        {message.metadata.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {(message.metadata.confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                        {message.metadata.execution_time && (
                          <span className="text-xs opacity-60 hidden sm:inline">
                            {message.metadata.execution_time}ms
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs opacity-50 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%]">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 sm:px-4 sm:py-2 bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary"></div>
                    <span className="text-xs sm:text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Input Area */}
      <div className="border-t p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50 dark:bg-gray-800">
        {/* Image Preview */}
        {selectedImage && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Image className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 truncate flex-1">
              {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(1)}MB)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              ×
            </Button>
          </div>
        )}

        {/* MCB Status */}
        {lastAnalysis && (
          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Zap className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 truncate">
              <span className="hidden sm:inline">AI selected: </span>
              {lastAnalysis.selected_model.name} ({(lastAnalysis.confidence * 100).toFixed(0)}%)
            </span>
          </div>
        )}
        
        {/* Input Controls */}
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
            disabled={loading}
            title="Upload plant image for disease detection"
            className="flex-shrink-0"
          >
            <Upload className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1 hidden sm:inline">Upload</span>
          </Button>
          
          <Textarea
            placeholder="Ask about crops, diseases, or upload an image..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="flex-1 min-h-[40px] max-h-[100px] sm:max-h-[120px] resize-none text-sm"
          />
          
          <Button 
            size="sm" 
            onClick={handleSend} 
            disabled={loading || (!input.trim() && !selectedImage)}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="border-t p-3 sm:p-4">
          <div className="text-red-500 text-xs sm:text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
      
      <div className="border-t p-2 sm:p-3 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          <span className="hidden sm:inline">🤖 I automatically select the best AI model for your agricultural questions!</span>
          <span className="sm:hidden">Powered AI Assistant</span>
        </p>
      </div>
    </div>
  )
}
