"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CloudRain, Send, User } from "lucide-react"
import { useServerAction } from "../hooks/useServerAction"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function CropRecommendationChat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your crop recommendation assistant. What would you like to know about planting crops in your current conditions?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const { sendMessage, loading, error } = useServerAction()

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate AI response
    const response = await sendMessage(input)

    const aiMessage: Message = {
      id: Date.now().toString(),
      content: response,
      role: "assistant",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-md">
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
                  <p className="text-sm">{message.content}</p>
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
        </div>
      </ScrollArea>
      <div className="border-t p-4 flex gap-2">
        <Input
          placeholder="Ask about crop recommendations..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend()
            }
          }}
        />
        <Button size="icon" onClick={handleSend} disabled={loading}>
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </>
          )}
        </Button>
      </div>
      {error && <div className="text-red-500 text-sm p-4">{error}</div>}
    </div>
  )
}
