#!/usr/bin/env node
/**
 * Test script to verify MCB frontend-backend connection
 */

const MCB_BACKEND_URL = process.env.MCB_BACKEND_URL || 'http://localhost:8001'
const FRONTEND_API_URL = 'http://localhost:3000/api/mcb'

async function testBackendConnection() {
  console.log('🔧 Testing MCB Backend Connection...')
  console.log(`Backend URL: ${MCB_BACKEND_URL}`)
  
  try {
    const response = await fetch(`${MCB_BACKEND_URL}/mcb/health`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ MCB Backend is running')
      console.log(`   Status: ${data.status}`)
      console.log(`   Active Models: ${data.active_models}`)
      return true
    } else {
      console.log(`❌ MCB Backend returned ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ MCB Backend connection failed: ${error.message}`)
    return false
  }
}

async function testFrontendAPI() {
  console.log('\n🌐 Testing Frontend API...')
  console.log(`Frontend API URL: ${FRONTEND_API_URL}`)
  
  try {
    const response = await fetch(FRONTEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'health'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Frontend API is working')
      console.log(`   Status: ${data.status}`)
      console.log(`   MCB Available: ${data.mcb_available}`)
      console.log(`   Version: ${data.version}`)
      return true
    } else {
      console.log(`❌ Frontend API returned ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ Frontend API connection failed: ${error.message}`)
    return false
  }
}

async function testEndToEnd() {
  console.log('\n🚀 Testing End-to-End Connection...')
  
  try {
    const response = await fetch(FRONTEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'chat',
        message: 'What crop should I plant?',
        user_type: 'farmer',
        user_id: 'test_user'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ End-to-end connection working')
      console.log(`   Model Used: ${data.result.model_used}`)
      console.log(`   Response Source: ${data.analysis.source}`)
      console.log(`   Response Preview: ${data.result.response.substring(0, 100)}...`)
      return true
    } else {
      console.log(`❌ End-to-end test failed: ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`❌ End-to-end test failed: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🧪 MCB Frontend-Backend Connection Test')
  console.log('=' * 50)
  
  const backendOk = await testBackendConnection()
  const frontendOk = await testFrontendAPI()
  const endToEndOk = await testEndToEnd()
  
  console.log('\n📊 Test Results:')
  console.log(`${backendOk ? '✅' : '❌'} MCB Backend`)
  console.log(`${frontendOk ? '✅' : '❌'} Frontend API`)
  console.log(`${endToEndOk ? '✅' : '❌'} End-to-End`)
  
  if (backendOk && frontendOk && endToEndOk) {
    console.log('\n🎉 All tests passed! Frontend is connected to MCB backend.')
    console.log('\nNext steps:')
    console.log('1. Your frontend now uses real AI models')
    console.log('2. Test in your Next.js app UI')
    console.log('3. Deploy both frontend and backend')
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.')
    console.log('\nTroubleshooting:')
    console.log('1. Make sure MCB backend is running: python start.py')
    console.log('2. Make sure Next.js frontend is running: npm run dev')
    console.log('3. Check environment variables in .env.local')
  }
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch(console.error)
