// Test environment variables
// Run with: node scripts/test-env.js

require('dotenv').config({ path: '.env.local' });

const testEnvironment = () => {
  console.log('🔍 Testing Environment Variables...\n')
  
  // Check if we're in a Next.js environment
  console.log('📋 Environment Check:')
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set')
  console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set')
  console.log('- OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL || 'not set')
  console.log('- AI_BACKEND_URL:', process.env.AI_BACKEND_URL || 'not set')
  
  if (process.env.OPENAI_API_KEY) {
    console.log('\n✅ OpenAI API Key is configured!')
    console.log('   Key starts with:', process.env.OPENAI_API_KEY.substring(0, 7) + '...')
  } else {
    console.log('\n❌ OpenAI API Key is missing!')
    console.log('   Please add OPENAI_API_KEY to your .env.local file')
    console.log('   Get your key from: https://platform.openai.com/api-keys')
  }
  
  console.log('\n🌐 Backend Status:')
  console.log('- AI Backend URL:', process.env.AI_BACKEND_URL || 'http://localhost:8000')
  console.log('- Make sure your Python backend is running on this URL')
}

testEnvironment() 