import { NextRequest, NextResponse } from 'next/server'

const MCB_BASE_URL = process.env.MCB_API_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (for image uploads)
      const formData = await request.formData()
      const action = formData.get('action') as string
      
      if (action === 'analyze-with-image') {
        // Forward the FormData directly to MCB
        const response = await fetch(`${MCB_BASE_URL}/mcb/analyze-with-image`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          return NextResponse.json(
            { error: `MCB API error: ${errorText}` },
            { status: response.status }
          )
        }

        const result = await response.json()
        return NextResponse.json(result)
      }
    } else {
      // Handle JSON data
      const body = await request.json()
      const { action, ...data } = body

      let endpoint = ''
      let method = 'POST'

      switch (action) {
        case 'analyze':
          endpoint = '/mcb/analyze'
          break
        case 'execute':
          endpoint = '/mcb/execute'
          break
        case 'get-models':
          endpoint = '/mcb/models'
          method = 'GET'
          break
        case 'health':
          endpoint = '/mcb/health'
          method = 'GET'
          break
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          )
      }

      const response = await fetch(`${MCB_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: `MCB API error: ${errorText}` },
          { status: response.status }
        )
      }

      const result = await response.json()
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: 'Unsupported request format' },
      { status: 400 }
    )

  } catch (error) {
    console.error('MCB API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'health'

    let endpoint = ''
    switch (action) {
      case 'models':
        endpoint = '/mcb/models'
        break
      case 'health':
        endpoint = '/mcb/health'
        break
      case 'stats':
        endpoint = '/mcb/stats'
        break
      default:
        endpoint = '/mcb/health'
    }

    const response = await fetch(`${MCB_BASE_URL}${endpoint}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `MCB API error: ${errorText}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('MCB API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
