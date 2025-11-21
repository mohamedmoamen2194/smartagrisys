import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CropRecommendationChatMCB } from "@/components/crop-recommendation-chat-mcb"
import { Zap, Bot, Brain } from "lucide-react"
import { FarmerPageHeader } from "@/components/farmer/page-header"

export default function ChatbotPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <FarmerPageHeader title="AI Assistant" actions={<Badge variant="secondary" className="flex items-center gap-1 text-xs"><Zap className="h-3 w-3" /><span className="hidden sm:inline">AI Powered</span><span className="sm:hidden"></span></Badge>} />

      <div className="grid gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <CardHeader className="pb-2 p-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <span className="hidden sm:inline">Intelligent Selection</span>
                <span className="sm:hidden">Smart AI</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">AI model for your specific question</span>
                <span className="sm:hidden">Auto-selects best AI model</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-3 sm:p-4">
            <CardHeader className="pb-2 p-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Multi-Modal Analysis</span>
                <span className="sm:hidden">Multi-Modal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">Supports text queries and image uploads for comprehensive analysis</span>
                <span className="sm:hidden">Text & image analysis</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 p-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="hidden sm:inline">Enhanced Results</span>
                <span className="sm:hidden">Enhanced</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">Get detailed recommendations and treatment plans</span>
                <span className="sm:hidden">Detailed recommendations</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Interface */}
        <Card className="min-h-0">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
              <span>Smart Agriculture Assistant</span>
              <Badge variant="outline" className="text-xs w-fit">
                <span className="hidden sm:inline"></span>
                <span className="sm:hidden"></span>
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              <span className="hidden sm:inline">
                Ask questions about crops, diseases, or upload images for analysis. 
                The system will automatically select the best AI model for your needs.
              </span>
              <span className="sm:hidden">
                Ask about crops, diseases, or upload images for AI analysis.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CropRecommendationChatMCB 
              userType="farmer"
              userContext={{
                location: "Farm Location", // You can make this dynamic
                cropTypes: ["tomato", "corn", "wheat"], // You can get this from user profile
                farmSize: 10 // You can get this from user profile
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
