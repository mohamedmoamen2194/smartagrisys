/**
 * Test script to check if an OpenRouter model is available
 * Usage: node scripts/test-openrouter-model.js [model-name]
 */

const model = process.argv[2] || process.env.LLM_MODEL || "meta-llama/llama-3.1-8b-instruct"
const apiKey = process.env.OPENROUTER_API_KEY

if (!apiKey) {
  console.error("❌ OPENROUTER_API_KEY not set in environment")
  console.error("   Set it in .env.local or run: $env:OPENROUTER_API_KEY='your-key'")
  process.exit(1)
}

console.log(`🧪 Testing model: ${model}`)
console.log(`🔑 API Key: ${apiKey.substring(0, 15)}...`)

fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "SmartAgriSys Test",
  },
  body: JSON.stringify({
    model: model,
    messages: [
      {
        role: "user",
        content: "Hello, this is a test. Please respond with 'Test successful'."
      }
    ],
    max_tokens: 50,
  }),
})
  .then(async (response) => {
    const text = await response.text()
    
    if (!response.ok) {
      console.error(`❌ Error (${response.status}):`, text)
      console.error(`\n💡 Try these alternative models:`)
      console.error(`   - meta-llama/llama-3.1-8b-instruct`)
      console.error(`   - google/gemma-2-2b-it`)
      console.error(`   - microsoft/phi-3-mini-4k-instruct`)
      console.error(`\n📋 Check available models at: https://openrouter.ai/models`)
      process.exit(1)
    }
    
    const data = JSON.parse(text)
    console.log("✅ Model is available!")
    console.log("📝 Response:", data.choices[0].message.content)
  })
  .catch((error) => {
    console.error("❌ Request failed:", error.message)
    process.exit(1)
  })

