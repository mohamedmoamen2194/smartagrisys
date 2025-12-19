"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, HeartHandshake, TrendingUp, Users, Leaf, Zap, Shield } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"

export default function AboutUsPage() {
  const { t } = useTranslations()
  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              {t("aboutUs.title")} <span style={{color: 'hsl(var(--primary))'}}>{t("aboutUs.titleHighlight")}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
              {t("aboutUs.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Impact */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Target className="h-8 w-8" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <CardTitle className="text-2xl mb-4">{t("aboutUs.ourMission")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("aboutUs.missionDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <HeartHandshake className="h-8 w-8" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <CardTitle className="text-2xl mb-4">{t("aboutUs.ourVision")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("aboutUs.visionDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <TrendingUp className="h-8 w-8" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <CardTitle className="text-2xl mb-4">{t("aboutUs.ourImpact")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("aboutUs.impactDesc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("aboutUs.whatWeDo")}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Leaf className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("aboutUs.smartAgricultureSolutions")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("aboutUs.smartAgricultureDesc")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("aboutUs.directMarketplace")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("aboutUs.directMarketplaceDesc")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("aboutUs.aiPoweredInsights")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("aboutUs.aiPoweredInsightsDesc")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t("aboutUs.sustainablePractices")}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("aboutUs.sustainablePracticesDesc")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("aboutUs.whyChooseUs")}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { title: t("aboutUs.provenAccuracy"), desc: t("aboutUs.provenAccuracyDesc") },
              { title: t("aboutUs.easyToUse"), desc: t("aboutUs.easyToUseDesc") },
              { title: t("aboutUs.directConnection"), desc: t("aboutUs.directConnectionDesc") },
              { title: t("aboutUs.realtimeInsights"), desc: t("aboutUs.realtimeInsightsDesc") },
              { title: t("aboutUs.comprehensiveTools"), desc: t("aboutUs.comprehensiveToolsDesc") },
              { title: t("aboutUs.support247"), desc: t("aboutUs.support247Desc") }
            ].map((item, idx) => (
              <Card key={idx} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

