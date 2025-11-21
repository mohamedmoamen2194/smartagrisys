import { NextRequest, NextResponse } from 'next/server'

// Use our internal mock MCB API instead of external server

interface ChatMessage {
  message: string
  conversationId?: string
  userId?: string
  userType?: 'farmer' | 'customer'
  location?: string
  cropTypes?: string[]
  farmSize?: number
}

interface MCBResponse {
  selected_model: {
    model_id: string
    name: string
    type: string
    description: string
  }
  confidence: number
  reasoning: string
  required_inputs: Record<string, any>
  can_execute: boolean
  session_id: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatMessage = await request.json()
    const { message, conversationId, userId = 'default-user', userType = 'farmer' } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Step 1: Analyze message with our internal MCB mock API
    const mcbAnalysisResponse = await fetch(`${request.nextUrl.origin}/api/mcb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze',
        message,
        user_id: userId,
        user_type: userType,
        session_id: conversationId,
        location: body.location,
        crop_types: body.cropTypes,
        farm_size: body.farmSize
      }),
    })

    if (!mcbAnalysisResponse.ok) {
      const errorText = await mcbAnalysisResponse.text()
      throw new Error(`analysis failed: ${errorText}`)
    }

    const mcbData = await mcbAnalysisResponse.json()
    
    // Use the actual MCB response structure instead of mock
    const mcbResult: MCBResponse = {
      selected_model: {
        model_id: mcbData.selected_model?.id || 'crop_recommendation_v1',
        name: mcbData.selected_model?.name || 'Crop Recommendation',
        type: mcbData.selected_model?.type || 'crop_recommendation',
        description: mcbData.selected_model?.description || 'AI model for crop recommendations'
      },
      confidence: mcbData.confidence || 0.8,
      reasoning: mcbData.reasoning || 'analysis completed',
      required_inputs: {},
      can_execute: false, // MCB backend already executed
      session_id: mcbData.session_id || conversationId || `session_${Date.now()}`
    }

    // Step 2: Return the actual MCB response
      try {
      // Use the actual response from MCB backend
      const responseContent = mcbData.response || "I'm here to help with your agricultural questions!"
        
        return NextResponse.json({
          message: {
            content: responseContent,
            role: 'assistant',
            timestamp: new Date(),
            metadata: {
              model_used: mcbResult.selected_model.name,
              confidence: mcbResult.confidence,
            execution_time: 150,
              model_type: mcbResult.selected_model.type
            }
          },
          conversationId: mcbResult.session_id,
          mcb_analysis: {
            selected_model: mcbResult.selected_model,
            confidence: mcbResult.confidence,
            reasoning: mcbResult.reasoning
          }
        })
      } catch (executionError) {
        console.error('Model execution failed:', executionError)
        // Fall through to analysis-only response
    }

    // Step 3: Return analysis with guidance for required inputs
    const analysisResponse = formatAnalysisResponse(mcbResult, message)

    return NextResponse.json({
      message: {
        content: analysisResponse,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          model_selected: mcbResult.selected_model.name,
          confidence: mcbResult.confidence,
          requires_input: !mcbResult.can_execute
        }
      },
      conversationId: mcbResult.session_id,
      mcb_analysis: {
        selected_model: mcbResult.selected_model,
        confidence: mcbResult.confidence,
        reasoning: mcbResult.reasoning,
        required_inputs: mcbResult.required_inputs
      }
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

function extractInputsFromMessage(message: string, modelType: string): Record<string, any> {
  const inputs: Record<string, any> = {}

  if (modelType === 'crop_recommendation') {
    // Try to extract numerical values for crop recommendation
    const numbers = message.match(/\d+(?:\.\d+)?/g)
    if (numbers && numbers.length >= 7) {
      inputs.features = numbers.slice(0, 7).map(n => parseFloat(n))
    } else {
      // Use default values if not provided
      inputs.features = [20, 15, 25, 25.0, 60.0, 6.5, 100.0]
    }
  }

  return inputs
}

function formatModelResult(executionResult: any, selectedModel: any): string {
  const result = executionResult.result
  const modelName = selectedModel.name
  const executionTime = executionResult.execution_time_ms

  if (result.disease) {
    // Disease detection result
    const disease = result.disease.replace(/_/g, ' ')
    const confidence = result.confidence || 0
    const treatments = result.treatment_recommendations || []
    const severity = result.severity || 'UNKNOWN'

    let response = `🔍 **Disease Analysis Complete**\n\n`
    response += `**Disease Detected:** ${disease}\n`
    response += `**Confidence:** ${(confidence * 100).toFixed(1)}%\n`
    response += `**Severity Level:** ${severity}\n\n`

    if (treatments.length > 0) {
      response += `**Recommended Treatments:**\n`
      treatments.forEach((treatment: string, index: number) => {
        response += `${index + 1}. ${treatment}\n`
      })
    }

    response += `\n*Analysis completed in ${executionTime}ms using ${modelName}*`
    return response
  }

  if (result.crop) {
    // Crop recommendation result
    const crop = result.crop
    const soilRecs = result.soil_recommendations || []
    const plantingTips = result.planting_recommendations || []
    const alternatives = result.alternative_crops || []

    let response = `🌱 **Crop Recommendation Complete**\n\n`
    response += `**Recommended Crop:** ${crop.charAt(0).toUpperCase() + crop.slice(1)}\n\n`

    if (soilRecs.length > 0) {
      response += `**Soil Recommendations:**\n`
      soilRecs.forEach((rec: string) => {
        response += `• ${rec}\n`
      })
      response += `\n`
    }

    if (plantingTips.length > 0) {
      response += `**Planting Tips:**\n`
      plantingTips.forEach((tip: string) => {
        response += `• ${tip}\n`
      })
      response += `\n`
    }

    if (alternatives.length > 0) {
      response += `**Alternative Crops:** ${alternatives.join(', ')}\n\n`
    }

    response += `*Analysis completed in ${executionTime}ms using ${modelName}*`
    return response
  }

  // Generic result
  return `✅ **Analysis Complete**\n\n${JSON.stringify(result, null, 2)}\n\n*Completed in ${executionTime}ms using ${modelName}*`
}

function formatAnalysisResponse(mcbResult: MCBResponse, originalMessage: string): string {
  const model = mcbResult.selected_model
  const confidence = mcbResult.confidence
  const reasoning = mcbResult.reasoning
  const requiredInputs = mcbResult.required_inputs

  let response = `🤖 **I understand you're asking:** "${originalMessage}"\n\n`
  response += `${reasoning}\n\n`

  if (requiredInputs && Object.keys(requiredInputs).length > 0) {
    response += `**To provide you with accurate results, I need:**\n\n`
    
    Object.entries(requiredInputs).forEach(([inputName, inputInfo]: [string, any]) => {
      if (inputInfo.type === 'file') {
        response += `📷 **${inputInfo.description}**\n`
        if (inputInfo.guidance) {
          response += `💡 *Tip: ${inputInfo.guidance}*\n`
        }
        if (inputInfo.formats) {
          response += `📋 Supported formats: ${inputInfo.formats.join(', ')}\n`
        }
      } else if (inputInfo.type === 'form') {
        response += `📋 **${inputInfo.description}**\n`
        if (inputInfo.fields) {
          Object.entries(inputInfo.fields).forEach(([field, desc]) => {
            response += `   • ${desc}\n`
          })
        }
      }
    })
    
    if (model.type === 'disease_detection') {
      response += `\n🔍 Once you upload the image, I'll analyze it using advanced AI to identify any diseases and provide treatment recommendations!`
    } else {
      response += `\nPlease provide this information and I'll give you detailed analysis!`
    }
  } else {
    response += `I have all the information needed. Let me analyze this for you...`
  }

  return response
}

// GET and DELETE methods for conversation management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // For now, return empty history - you can implement conversation storage later
    return NextResponse.json({ history: [] })
  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversation history' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    // For now, just return success - you can implement conversation clearing later
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to clear conversation' },
      { status: 500 }
    )
  }
}
