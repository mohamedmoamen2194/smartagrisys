// Test OpenAI API directly
// Run with: node scripts/test-openai.js

require('dotenv').config({ path: '.env.local' });

const testOpenAI = async () => {
  console.log('🧪 Testing OpenAI API directly...\n')
  
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  
  console.log('📋 Configuration:')
  console.log('- API Key:', apiKey ? '✅ Set' : '❌ Not set')
  console.log('- Base URL:', baseUrl)
  
  if (!apiKey) {
    console.log('❌ OpenAI API key is missing!')
    return
  }
  
  try {
    console.log('\n🔄 Testing OpenAI API call...')
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Hello! Can you help me with farming?'
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.log(`❌ OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      return
    }
    
    const data = await response.json()
    console.log('✅ OpenAI API is working!')
    console.log('📝 Response:', data.choices[0].message.content)
    
  } catch (error) {
    console.log('❌ Error calling OpenAI API:', error.message)
  }
}

testOpenAI() 