"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, TrendingUp, AlertCircle } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"

export default function WeatherMarketPage() {
  const { t } = useTranslations()
  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Cloud className="h-12 w-12" style={{color: 'hsl(var(--primary))'}} />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                {t("weatherMarket.title")} <span style={{color: 'hsl(var(--primary))'}}>{t("weatherMarket.titleHighlight")}</span>
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
              {t("weatherMarket.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Placeholder Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-dashed">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-yellow-100 dark:bg-yellow-900 w-fit">
                  <AlertCircle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-2xl mb-4">{t("weatherMarket.comingSoon")}</CardTitle>
                <CardDescription className="text-lg">
                  {t("weatherMarket.comingSoonDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-center">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t("weatherMarket.plannedFeatures")}</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>• {t("weatherMarket.realtimeWeatherForecasts")}</li>
                      <li>• {t("weatherMarket.marketDemandAnalysis")}</li>
                      <li>• {t("weatherMarket.priceTrends")}</li>
                      <li>• {t("weatherMarket.seasonalPlanting")}</li>
                      <li>• {t("weatherMarket.weatherAlerts")}</li>
                    </ul>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("weatherMarket.checkBackSoon")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

