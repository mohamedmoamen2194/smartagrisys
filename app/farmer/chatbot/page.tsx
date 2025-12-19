"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CropRecommendationChatMCB } from "@/components/crop-recommendation-chat-mcb"
import { Zap, Bot, Brain } from "lucide-react"
import { FarmerPageHeader } from "@/components/farmer/page-header"
import { useTranslations } from "@/hooks/useTranslations"

export default function ChatbotPage() {
  const { t } = useTranslations()
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <FarmerPageHeader title={t("chatbot.title")} actions={<Badge variant="secondary" className="flex items-center gap-1 text-xs"><Zap className="h-3 w-3" /><span className="hidden sm:inline">AI Powered</span><span className="sm:hidden"></span></Badge>} />

      <div className="grid gap-3 sm:gap-4 mt-4 sm:mt-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <CardHeader className="pb-2 p-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <span className="hidden sm:inline">{t("chatbot.intelligentSelection")}</span>
                <span className="sm:hidden">{t("chatbot.intelligentSelectionShort")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">{t("chatbot.intelligentSelectionDesc")}</span>
                <span className="sm:hidden">{t("chatbot.intelligentSelectionDescShort")}</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-3 sm:p-4">
            <CardHeader className="pb-2 p-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">{t("chatbot.multiModalAnalysis")}</span>
                <span className="sm:hidden">{t("chatbot.multiModalAnalysisShort")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">{t("chatbot.multiModalAnalysisDesc")}</span>
                <span className="sm:hidden">{t("chatbot.multiModalAnalysisDescShort")}</span>
              </p>
            </CardContent>
          </Card>
          
          <Card className="p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 p-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="hidden sm:inline">{t("chatbot.enhancedResults")}</span>
                <span className="sm:hidden">{t("chatbot.enhancedResultsShort")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs text-muted-foreground">
                <span className="hidden sm:inline">{t("chatbot.enhancedResultsDesc")}</span>
                <span className="sm:hidden">{t("chatbot.enhancedResultsDescShort")}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Interface */}
        <Card className="min-h-0">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
              <span>{t("chatbot.smartAgricultureAssistant")}</span>
              <Badge variant="outline" className="text-xs w-fit">
                <span className="hidden sm:inline"></span>
                <span className="sm:hidden"></span>
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              <span className="hidden sm:inline">
                {t("chatbot.assistantDescription")}
              </span>
              <span className="sm:hidden">
                {t("chatbot.assistantDescriptionShort")}
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
