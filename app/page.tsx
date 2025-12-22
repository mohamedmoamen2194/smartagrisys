"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Brain, 
  Sprout, 
  Apple, 
  MessageSquare, 
  Package, 
  BarChart3,
  ArrowRight,
  Users,
  ShoppingCart
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "@/hooks/useTranslations"

export default function Home() {
  const { t } = useTranslations()
  
  const sections = [
    {
      title: t("home.aboutUsCard.title"),
      description: t("home.aboutUsCard.description"),
      icon: Users,
      href: "/about-us",
      image: "/placeholder.jpg",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: t("home.servicesCard.title"),
      description: t("home.servicesCard.description"),
      icon: Package,
      href: "/services",
      image: "/placeholder.jpg",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: t("home.contactUsCard.title"),
      description: t("home.contactUsCard.description"),
      icon: MessageSquare,
      href: "/contact-us",
      image: "/placeholder.jpg",
      color: "bg-purple-100 dark:bg-purple-900"
    }
  ]

  const features = [
    {
      icon: Brain,
      title: t("home.aiDiseaseDetection"),
      description: t("home.aiDiseaseDescription")
    },
    {
      icon: Sprout,
      title: t("home.smartCropRecommendations"),
      description: t("home.smartCropDescription")
    },
    {
      icon: Apple,
      title: t("home.fruitSizingAnalysis"),
      description: t("home.fruitSizingDescription")
    },
    {
      icon: BarChart3,
      title: t("home.aiAnalyticsDashboard"),
      description: t("home.aiAnalyticsDescription")
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14 lg:pt-16" 
        style={{backgroundImage: 'linear-gradient(to bottom right, hsl(var(--secondary)/0.25), hsl(var(--accent)/0.25))'}}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img src="/img.svg" alt="Logo" className="h-80 w-80 sm:h-84 sm:w-84" />
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
              {['digital', 'reliable', 'consistent', 'scalable'].map((word) => (
                <span 
                  key={word}
                  className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium"
                  style={{color: 'hsl(var(--primary))'}}
                >
                  {t(`home.tags.${word}`)}
                </span>
              ))}
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6 px-4">
              {t("home.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button size="default" className="text-sm px-6 py-2" asChild>
                <Link href="/auth/farmer/register">{t("home.getStartedAsFarmer")}</Link>
              </Button>
              <Button size="default" variant="outline" className="text-sm px-6 py-2" asChild>
                <Link href="/store">{t("common.browseStore")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
              {t("home.ourFeatures")}
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("home.featuresDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <Card key={idx} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 w-fit">
                    <feature.icon className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sections Preview */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
              {t("home.explorePlatform")}
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("home.exploreDescription")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {sections.map((section, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`${section.color} h-32 relative overflow-hidden flex items-center justify-center`}>
                  <section.icon className="h-16 w-16 opacity-20 transition-opacity" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full text-xs" variant="outline" size="sm">
                    <Link href={section.href}>
                      {t("home.learnMore")} <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            {t("home.readyToTransform")}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            {t("home.readyDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="default" className="text-sm px-6 py-2" asChild>
              <Link href="/auth/farmer/register">{t("home.startAsFarmer")}</Link>
            </Button>
            <Button size="default" variant="outline" className="text-sm px-6 py-2" asChild>
              <Link href="/store">{t("home.startShopping")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
