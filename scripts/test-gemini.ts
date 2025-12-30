// Test script to verify Gemini API key and list available models
// Run with: npx tsx scripts/test-gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)

async function testGemini() {
  console.log('Testing Gemini API...\n')

  // Try to list available models (if supported)
  try {
    // Try the most basic model first
    console.log('Testing with gemini-pro...')
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent('Say hello in one sentence.')
    const response = await result.response
    console.log('✅ Success! Response:', response.text())
    console.log('\n✅ Your Gemini API key is working correctly!')
    console.log('✅ You can use "gemini-pro" as your model name.')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
    
    if (error.message?.includes('404')) {
      console.log('\n💡 Suggestions:')
      console.log('1. Verify your API key is correct')
      console.log('2. Check if Gemini API is enabled in Google Cloud Console')
      console.log('3. Ensure your API key has the necessary permissions')
      console.log('4. Try creating a new API key from: https://makersuite.google.com/app/apikey')
    }
  }
}

testGemini()



















