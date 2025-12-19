"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  ShoppingCart, 
  Brain, 
  Sprout, 
  Apple, 
  MessageSquare, 
  Package, 
  BarChart3,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/hooks/useTranslations"

export default function ServicesPage() {
  const { t } = useTranslations()
  const farmerServices = [
    {
      icon: Brain,
      title: t("services.aiDiseaseDetection"),
      description: t("services.aiDiseaseDetectionDesc"),
      features: [
        t("services.instantDiseaseIdentification"),
        t("services.treatmentRecommendations"),
        t("services.preventionStrategies"),
        t("services.historicalTracking")
      ]
    },
    {
      icon: Sprout,
      title: t("services.smartCropRecommendations"),
      description: t("services.smartCropRecommendationsDesc"),
      features: [
        t("services.soilAnalysisIntegration"),
        t("services.weatherBasedSuggestions"),
        t("services.yieldPredictions"),
        t("services.marketDemandInsights")
      ]
    },
    {
      icon: Apple,
      title: t("services.fruitSizingAnalysis"),
      description: t("services.fruitSizingAnalysisDesc"),
      features: [
        t("services.automatedSizing"),
        t("services.qualityAssessment"),
        t("services.harvestTiming"),
        t("services.pricingOptimization")
      ]
    },
    {
      icon: MessageSquare,
      title: t("services.aiChatbotAssistant"),
      description: t("services.aiChatbotAssistantDesc"),
      features: [
        t("services.availability247"),
        t("services.contextAwareResponses"),
        t("services.multilanguageSupport"),
        t("services.expertKnowledgeBase")
      ]
    },
    {
      icon: Package,
      title: t("services.inventoryManagement"),
      description: t("services.inventoryManagementDesc"),
      features: [
        t("services.realtimeInventoryTracking"),
        t("services.stockAlerts"),
        t("services.salesAnalytics"),
        t("services.orderManagement")
      ]
    },
    {
      icon: BarChart3,
      title: t("services.aiAnalysisDashboard"),
      description: t("services.aiAnalysisDashboardDesc"),
      features: [
        t("services.performanceMetrics"),
        t("services.trendAnalysis"),
        t("services.revenueTracking"),
        t("services.customizableReports")
      ]
    }
  ]

  const customerServices = [
    {
      title: t("services.freshProduceMarketplace"),
      description: t("services.freshProduceMarketplaceDesc"),
      features: [
        t("services.wideVarietyOfProducts"),
        t("services.qualityGuaranteed"),
        t("services.directFromFarm"),
        t("services.freshnessTracking")
      ]
    },
    {
      title: t("services.securePaymentProcessing"),
      description: t("services.securePaymentProcessingDesc"),
      features: [
        t("services.multiplePaymentMethods"),
        t("services.secureTransactions"),
        t("services.paymentHistory"),
        t("services.refundSupport")
      ]
    },
    {
      title: t("services.realtimeOrderTracking"),
      description: t("services.realtimeOrderTrackingDesc"),
      features: [
        t("services.orderStatusUpdates"),
        t("services.deliveryTracking"),
        t("services.estimatedDeliveryTimes"),
        t("services.deliveryNotifications")
      ]
    },
    {
      title: t("services.fastReliableDelivery"),
      description: t("services.fastReliableDeliveryDesc"),
      features: [
        t("services.fastDelivery"),
        t("services.freshnessGuarantee"),
        t("services.deliveryScheduling"),
        t("services.packageTracking")
      ]
    }
  ]

  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              {t("services.title")} <span style={{color: 'hsl(var(--primary))'}}>{t("services.titleHighlight")}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
              {t("services.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* For Farmers Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Users className="h-12 w-12 text-green-600 dark:text-green-400" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {t("services.forFarmers")}
              </h2>
            </div>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("services.forFarmersDesc")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {farmerServices.map((service, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                    <service.icon className="h-8 w-8" style={{color: 'hsl(var(--primary))'}} />
                  </div>
                  <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/auth/farmer/register">
                {t("services.getStartedAsFarmer")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Customers Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <ShoppingCart className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                {t("services.forCustomers")}
              </h2>
            </div>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t("services.forCustomersDesc")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {customerServices.map((service, idx) => (
              <Card key={idx} className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/store">
                {t("common.browseStore")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

