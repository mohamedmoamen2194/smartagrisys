"use client"

import { useState } from 'react'
import MCBChatInterface from '@/components/mcb-chat-interface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bot, Settings, Activity, Database } from 'lucide-react'

export default function MCBTestPage() {
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const [mcbHealth, setMcbHealth] = useState<any>(null)
  const [availableModels, setAvailableModels] = useState<any[]>([])

  const checkMCBHealth = async () => {
    try {
      const response = await fetch('/api/mcb?action=health')
      const health = await response.json()
      setMcbHealth(health)
    } catch (error) {
      console.error('Failed to check MCB health:', error)
      setMcbHealth({ status: 'error', error: 'Failed to connect to MCB' })
    }
  }

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('/api/mcb?action=models')
      const data = await response.json()
      setAvailableModels(data.models || [])
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row items-center justify-center gap-2">
          <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          <span>MCB Testing Environment</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          <span className="hidden sm:inline">Test the Model Control Bridge intelligent model selection system</span>
          <span className="sm:hidden">Test MCB intelligent model selection</span>
        </p>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              MCB Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={checkMCBHealth} variant="outline" size="sm" className="w-full">
              Check Health
            </Button>
            {mcbHealth && (
              <div className="text-xs">
                <Badge variant={mcbHealth.status === 'healthy' ? 'default' : 'destructive'}>
                  {mcbHealth.status}
                </Badge>
                {mcbHealth.active_models && (
                  <p className="mt-1">Active Models: {mcbHealth.active_models}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Available Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={loadAvailableModels} variant="outline" size="sm" className="w-full">
              Load Models
            </Button>
            <div className="text-xs">
              <p>Found: {availableModels.length} models</p>
              {availableModels.slice(0, 2).map((model, i) => (
                <Badge key={i} variant="secondary" className="mr-1 mt-1 text-xs">
                  {model.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Selected Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedModel ? (
              <div className="text-xs space-y-1">
                <Badge variant="default">{selectedModel.name}</Badge>
                <p>Type: {selectedModel.type}</p>
                <p>Accuracy: {(selectedModel.accuracy * 100).toFixed(1)}%</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No model selected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto">
        <MCBChatInterface
          userId="test-user-123"
          userType="farmer"
          onModelSelected={setSelectedModel}
        />
      </div>

      {/* Test Instructions */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">🧪 Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">1. Test Disease Detection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Try: "My plant leaves have brown spots" or "What's wrong with my tomato plant?"
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2">2. Test Crop Recommendation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Try: "What crop should I plant?" or "I need crop recommendations for my soil"
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2">3. Test with Image</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Upload a plant image and ask: "What can you tell me about this plant?"
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2">4. Test Model Selection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Watch how the MCB selects different models based on your queries and inputs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
