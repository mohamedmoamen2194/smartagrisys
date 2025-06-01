import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CropRecommendationChat } from "@/components/crop-recommendation-chat"

export default function ChatbotPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Smart Agriculture Assistant</CardTitle>
          <CardDescription>
            Get help with crop recommendations, disease identification, and farming best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CropRecommendationChat />
        </CardContent>
      </Card>
    </div>
  )
}
