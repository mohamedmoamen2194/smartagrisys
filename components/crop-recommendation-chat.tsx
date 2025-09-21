"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CloudRain, Send, User, RefreshCw } from "lucide-react"
import { useLLMChat } from "../hooks/useLLMChat"
import { Message } from "@/lib/llm-orchestrator"

export function CropRecommendationChat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI-powered agricultural assistant. I can help you with crop recommendations, disease detection, weather analysis, and farming best practices. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  
  const { sendMessage, loading, error, clearConversation } = useLLMChat()

  const handleSend = async () => {
    if (!input.trim() || loading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Get AI response using LLM orchestrator
    const response = await sendMessage(input)

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      role: "assistant",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  const handleClearConversation = async () => {
    await clearConversation()
    setMessages([
      {
        id: "1",
        content:
          "Hello! I'm your AI-powered agricultural assistant. I can help you with crop recommendations, disease detection, weather analysis, and farming best practices. What would you like to know?",
        role: "assistant",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-md">
      <div className="border-b p-4 flex items-center justify-between">
        <h3 className="font-semibold">AI Agricultural Assistant</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearConversation}
          title="Clear conversation"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8">
                  {message.role === "user" ? (
                    <>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>
                        <CloudRain className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>
                    <CloudRain className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-4 flex gap-2">
        <Input
          placeholder="Ask about crops, diseases, weather, or farming practices..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={loading}
        />
        <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
      
      {error && (
        <div className="border-t p-4">
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
      
      <div className="border-t p-3 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          I can help with crop recommendations, disease detection, weather analysis, and farming advice. 
          Just ask me anything about agriculture!
        </p>
      </div>
    </div>
  )
}

