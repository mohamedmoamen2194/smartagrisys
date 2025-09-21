# LLM Orchestrator Setup Guide

## Overview

The LLM Orchestrator is a sophisticated chat system that integrates with your existing AI models to provide intelligent agricultural assistance. It replaces the simple keyword-based responses with a full LLM-powered conversation system.

## Features

- **Conversation Memory**: Maintains context across multiple messages
- **Tool Calling**: Automatically calls your AI models when needed
- **Enhanced Responses**: Provides detailed, contextual agricultural advice
- **Error Handling**: Graceful fallbacks and error recovery
- **Conversation Management**: Clear conversations and view history

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY="your-openai-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"

# AI Backend (Required)
AI_BACKEND_URL="http://localhost:8000"
```

### 2. Python Backend Setup

Ensure your Python backend is running with the correct endpoints:

```bash
# Start your FastAPI backend
cd smart_agri_models
uvicorn crop_rec.crop_rec_api:app --reload --port 8000
```

### 3. API Endpoints

The LLM orchestrator expects these endpoints:

- `POST /crop_rec/predict` - Crop recommendation
- `POST /disease_detection/predict` - Disease detection

## How It Works

### 1. Message Flow

```
User Message → LLM Orchestrator → OpenAI API → Tool Calling → AI Models → Enhanced Response
```

### 2. Tool Integration

The orchestrator automatically calls your AI models when needed:

- **Crop Recommendation**: When users ask about what to plant
- **Disease Detection**: When users upload plant images
- **Weather Analysis**: When users ask about weather conditions
- **Soil Analysis**: When users need soil recommendations

### 3. Conversation Management

- Each conversation has a unique ID
- Messages are stored in memory (can be extended to database)
- Context is maintained across the conversation
- Users can clear conversations

## Usage Examples

### Basic Questions
```
User: "What crops should I plant?"
Assistant: "I'll help you with crop recommendations. I need some information about your soil and weather conditions..."
```

### Disease Detection
```
User: "My tomato plants have yellow spots on the leaves"
Assistant: "I can help you identify the disease. Please upload a photo of the affected leaves..."
```

### Weather Analysis
```
User: "How will the weather affect my corn crop?"
Assistant: "Let me check the weather forecast for your location and provide recommendations..."
```

## API Endpoints

### Chat API

- `POST /api/chat` - Send a message
- `GET /api/chat?conversationId=xxx` - Get conversation history
- `DELETE /api/chat?conversationId=xxx` - Clear conversation

### AI Model APIs

- `POST /api/ai/crop-recommendation` - Get crop recommendations
- `POST /api/ai/disease-detection` - Detect plant diseases

## Customization

### Adding New Tools

1. Define the tool in `lib/llm-orchestrator.ts`:

```typescript
{
  name: "your_new_tool",
  description: "Description of what the tool does",
  parameters: {
    type: "object",
    properties: {
      // Define parameters
    },
    required: ["param1", "param2"]
  }
}
```

2. Implement the tool execution in the `executeTool` method:

```typescript
case "your_new_tool":
  return await this.yourNewTool(args)
```

3. Create the corresponding API endpoint.

### Modifying System Prompt

Edit the `getSystemPrompt()` method in `LLMOrchestrator` class to customize the assistant's behavior.

### Adding Conversation Persistence

Extend the `LLMOrchestrator` class to store conversations in a database instead of memory.

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**: Check your API key and billing
2. **Backend Connection**: Ensure your Python backend is running
3. **Tool Calling Failures**: Verify your AI model endpoints are working

### Debug Mode

Enable debug logging by adding console.log statements in the orchestrator methods.

## Performance Considerations

- **Response Time**: Tool calls add latency, consider caching
- **Memory Usage**: Conversations are stored in memory
- **API Costs**: Monitor OpenAI API usage
- **Rate Limiting**: Implement rate limiting for production

## Future Enhancements

- [ ] Database persistence for conversations
- [ ] User authentication and conversation isolation
- [ ] Advanced caching strategies
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Integration with IoT sensors
- [ ] Advanced analytics and insights 