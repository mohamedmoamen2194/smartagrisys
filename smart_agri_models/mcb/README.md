# Model Control Bridge (MCB)

The Model Control Bridge (MCB) is an intelligent system that acts as a decision layer between your chatbot and AI models. It automatically selects the most appropriate model based on user input and context.

## 🎯 Features

- **Intelligent Model Selection**: Automatically chooses the best AI model based on user queries
- **Context-Aware Decision Making**: Considers user type, location, and conversation history
- **Multi-Modal Input Support**: Handles text, images, and numerical data
- **Chatbot Integration**: Seamless integration with existing chatbot systems
- **Performance Monitoring**: Tracks model performance and response times
- **Extensible Architecture**: Easy to add new models and decision criteria

## 🏗️ Architecture

```
User Input → MCB Analysis → Model Selection → Model Execution → Enhanced Results
     ↓              ↓              ↓              ↓              ↓
  Chatbot → Decision Engine → Model Registry → Model Executor → Response
```

### Components

1. **Model Registry**: Central registry of all available AI models
2. **Decision Engine**: Intelligent model selection based on input analysis
3. **Model Executor**: Handles model execution and result processing
4. **Chatbot Integration**: Interface layer for chatbot systems
5. **MCB API**: RESTful API for all MCB operations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd smart_agri_models/mcb
pip install -r requirements.txt
```

### 2. Start the MCB API Server

```bash
uvicorn mcb_api:app --reload --port 8001
```

### 3. Test the System

```bash
# Health check
curl http://localhost:8001/mcb/health

# Get available models
curl http://localhost:8001/mcb/models

# Analyze a query
curl -X POST http://localhost:8001/mcb/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My plant leaves have brown spots",
    "user_id": "farmer123",
    "user_type": "farmer"
  }'
```

## 📡 API Endpoints

### Analysis Endpoints

- `POST /mcb/analyze` - Analyze text query and recommend model
- `POST /mcb/analyze-with-image` - Analyze query with uploaded image
- `POST /mcb/execute` - Execute selected model with inputs

### Management Endpoints

- `GET /mcb/models` - Get all registered models
- `GET /mcb/health` - System health check
- `GET /mcb/stats` - MCB statistics and metrics

## 🤖 Chatbot Integration

### Basic Usage

```python
from mcb.chatbot_integration import chatbot_mcb_interface

# Process user message
response = await chatbot_mcb_interface.process_user_message(
    message="My tomato plants look sick",
    user_id="farmer123",
    user_type="farmer"
)

print(response["response_text"])
```

### With Image

```python
# Process message with image
with open("plant_image.jpg", "rb") as f:
    image_data = f.read()

response = await chatbot_mcb_interface.process_user_message(
    message="What's wrong with my plant?",
    user_id="farmer123",
    user_type="farmer",
    image_data=image_data
)
```

## 🧠 How It Works

### 1. Input Analysis
- **Intent Detection**: Identifies user intent (disease diagnosis, crop planning, etc.)
- **Entity Extraction**: Extracts relevant entities (crop names, symptoms, etc.)
- **Context Analysis**: Considers user profile and conversation history

### 2. Model Selection
- **Candidate Filtering**: Finds models matching the detected intent
- **Compatibility Check**: Ensures input types match model requirements
- **Scoring Algorithm**: Ranks models based on accuracy, performance, and context
- **Confidence Assessment**: Provides confidence score for the selection

### 3. Model Execution
- **Input Preparation**: Formats inputs according to model requirements
- **Async Execution**: Executes models asynchronously for better performance
- **Result Enhancement**: Adds treatment recommendations, alternatives, etc.
- **Error Handling**: Graceful error handling with fallback options

## 🔧 Configuration

### Adding New Models

```python
from mcb.model_registry import model_registry, ModelMetadata, ModelType, InputType

# Register new model
new_model = ModelMetadata(
    model_id="new_model_v1",
    name="New AI Model",
    model_type=ModelType.DISEASE_DETECTION,
    input_type=InputType.IMAGE,
    description="Description of the new model",
    version="1.0.0",
    accuracy=0.92,
    response_time_ms=800,
    endpoint="/new_model/predict",
    keywords=["keyword1", "keyword2"]
)

model_registry.register_model(new_model)
```

### Customizing Decision Logic

The decision engine can be customized by modifying the scoring algorithm in `decision_engine.py`:

```python
def _score_model(self, model, analysis, context):
    # Custom scoring logic
    score = 0.0
    
    # Add your custom criteria
    if custom_condition:
        score += 0.1
    
    return score
```

## 📊 Model Registry

The MCB maintains a registry of all available models with metadata:

- **Model Information**: Name, version, description
- **Performance Metrics**: Accuracy, response time
- **Input/Output Schemas**: Expected input format and output structure
- **Keywords**: Terms that trigger model selection
- **Status**: Active/inactive status

## 🎯 Decision Criteria

The MCB uses multiple criteria to select the best model:

1. **Intent Matching** (40%): How well the model matches detected intent
2. **Model Accuracy** (30%): Historical accuracy of the model
3. **Input Compatibility** (20%): Whether input types match
4. **Keyword Relevance** (10%): Keyword matching score
5. **Performance Bonus** (5%): Faster models get slight preference

## 📈 Monitoring & Analytics

### Performance Metrics
- Model selection accuracy
- Average response times
- User satisfaction scores
- Error rates

### Usage Statistics
- Most frequently selected models
- Common user intents
- Input type distribution
- Geographic usage patterns

## 🔒 Security Considerations

- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling
- User authentication integration
- Audit logging for all operations

## 🚀 Deployment

### Development
```bash
uvicorn mcb_api:app --reload --port 8001
```

### Production
```bash
uvicorn mcb_api:app --host 0.0.0.0 --port 8001 --workers 4
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "mcb_api:app", "--host", "0.0.0.0", "--port", "8001"]
```

## 🤝 Integration Examples

### Next.js API Route

```javascript
// pages/api/chat.js
export default async function handler(req, res) {
  const response = await fetch('http://localhost:8001/mcb/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  
  const result = await response.json();
  res.json(result);
}
```

### React Component

```jsx
const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  
  const handleSubmit = async () => {
    const result = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        user_id: 'user123',
        user_type: 'farmer'
      })
    });
    
    const data = await result.json();
    setResponse(data.response_text);
  };
  
  return (
    <div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSubmit}>Send</button>
      <div>{response}</div>
    </div>
  );
};
```

## 📝 Troubleshooting

### Common Issues

1. **Model Not Found**: Ensure model is registered in the registry
2. **Input Type Mismatch**: Check that input format matches model requirements
3. **Low Confidence Scores**: Review and update model keywords
4. **Slow Response Times**: Check model server status and network connectivity

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔮 Future Enhancements

- **Machine Learning for Model Selection**: Use ML to improve selection accuracy
- **A/B Testing Framework**: Test different selection strategies
- **Real-time Model Performance Monitoring**: Dynamic performance tracking
- **Auto-scaling**: Automatic scaling based on load
- **Multi-language Support**: Support for multiple languages
- **Advanced Context Understanding**: Better conversation context analysis

## 📄 License

This project is part of the SmartAgriSys platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

For more information, visit the [SmartAgriSys Documentation](../README.md).
