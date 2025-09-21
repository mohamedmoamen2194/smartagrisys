// Test script for LLM Orchestrator
// Run with: node scripts/test-llm-orchestrator.js
require('dotenv').config({ path: '.env.local' });
const testLLMOrchestrator = async () => {
  console.log('🧪 Testing LLM Orchestrator...\n')

  const baseUrl = 'http://localhost:3000'
  
  const testCases = [
    {
      name: 'Basic Greeting',
      message: 'Hello, how can you help me with farming?',
      expectedKeywords: ['agricultural', 'assistant', 'help', 'farming']
    },
    {
      name: 'Crop Recommendation Request',
      message: 'I have soil with nitrogen 50, phosphorus 30, potassium 25, temperature 25°C, humidity 70%, pH 6.5, and rainfall 120mm. What should I plant?',
      expectedKeywords: ['crop', 'recommendation', 'soil', 'weather', 'plant']
    },
    {
      name: 'Disease Detection Request',
      message: 'My tomato plants have yellow spots on the leaves. Can you help me identify the disease?',
      expectedKeywords: ['disease', 'detection', 'plant', 'problem', 'tomato']
    },
    {
      name: 'Weather Analysis Request',
      message: 'How will the weather affect my corn crop? My location is latitude 40.7128 and longitude -74.0060.',
      expectedKeywords: ['weather', 'forecast', 'location', 'coordinates', 'corn']
    },
    {
      name: 'Soil Analysis Request',
      message: 'I need a soil analysis for my farm. My soil sample ID is FARM001.',
      expectedKeywords: ['soil', 'analysis', 'sample', 'recommendations']
    }
  ]

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`)
    console.log(`Message: "${testCase.message}"`)
    
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const assistantMessage = data.message.content
      
      console.log(`✅ Response: "${assistantMessage.substring(0, 150)}..."`)
      
      // Check if response contains expected keywords
      const foundKeywords = testCase.expectedKeywords.filter(keyword => 
        assistantMessage.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (foundKeywords.length > 0) {
        console.log(`✅ Found expected keywords: ${foundKeywords.join(', ')}`)
      } else {
        console.log(`⚠️  No expected keywords found. Expected: ${testCase.expectedKeywords.join(', ')}`)
      }
      
      console.log(`📊 Conversation ID: ${data.conversationId}`)
      
      // Check if tool calls were made
      if (data.message.metadata && data.message.metadata.toolCalls) {
        console.log(`🔧 Tool calls made: ${data.message.metadata.toolCalls.length}`)
        data.message.metadata.toolCalls.forEach((toolCall, index) => {
          console.log(`  - Tool ${index + 1}: ${toolCall.function.name}`)
        })
      }
      
      console.log('')
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`)
    }
  }

  console.log('🎉 LLM Orchestrator test completed!')
}

// Check if running directly
if (require.main === module) {
  testLLMOrchestrator().catch(console.error)
}

module.exports = { testLLMOrchestrator } 