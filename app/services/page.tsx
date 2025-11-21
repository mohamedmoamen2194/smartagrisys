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

export default function ServicesPage() {
  const farmerServices = [
    {
      icon: Brain,
      title: "AI Disease Detection",
      description: "Upload images of your crops and get instant disease identification with 89% accuracy. Our MobileNetV2 model can detect various plant diseases and provide treatment recommendations.",
      features: [
        "Instant disease identification",
        "Treatment recommendations",
        "Prevention strategies",
        "Historical tracking"
      ]
    },
    {
      icon: Sprout,
      title: "Smart Crop Recommendations",
      description: "Get personalized crop recommendations based on your soil conditions, weather patterns, and location. Our Random Forest model achieves 92% accuracy in predicting optimal crops.",
      features: [
        "Soil analysis integration",
        "Weather-based suggestions",
        "Yield predictions",
        "Market demand insights"
      ]
    },
    {
      icon: Apple,
      title: "Fruit Sizing Analysis",
      description: "Automated fruit sizing and quality assessment to optimize harvest timing and pricing. Make data-driven decisions about when to harvest for maximum value.",
      features: [
        "Automated sizing",
        "Quality assessment",
        "Harvest timing",
        "Pricing optimization"
      ]
    },
    {
      icon: MessageSquare,
      title: "AI Chatbot Assistant",
      description: "Get instant answers to your agricultural questions with our LLM-powered chatbot. Access expert advice 24/7 on farming practices, crop management, and more.",
      features: [
        "24/7 availability",
        "Context-aware responses",
        "Multi-language support",
        "Expert knowledge base"
      ]
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Comprehensive inventory tracking and management system for seamless farm operations. Keep track of your products, stock levels, and sales all in one place.",
      features: [
        "Real-time inventory tracking",
        "Stock alerts",
        "Sales analytics",
        "Order management"
      ]
    },
    {
      icon: BarChart3,
      title: "AI Analysis Dashboard",
      description: "Real-time analytics and insights to monitor farm performance and make data-driven decisions. Track your progress, identify trends, and optimize operations.",
      features: [
        "Performance metrics",
        "Trend analysis",
        "Revenue tracking",
        "Customizable reports"
      ]
    }
  ]

  const customerServices = [
    {
      title: "Fresh Produce Marketplace",
      description: "Browse and purchase fresh, quality produce directly from local farmers. All products are verified for quality and freshness.",
      features: [
        "Wide variety of products",
        "Quality guaranteed",
        "Direct from farm",
        "Freshness tracking"
      ]
    },
    {
      title: "Secure Payment Processing",
      description: "Safe and secure payment processing with multiple payment options. Your financial information is protected with industry-standard encryption.",
      features: [
        "Multiple payment methods",
        "Secure transactions",
        "Payment history",
        "Refund support"
      ]
    },
    {
      title: "Real-time Order Tracking",
      description: "Track your orders from placement to delivery. Get real-time updates on order status and estimated delivery times.",
      features: [
        "Order status updates",
        "Delivery tracking",
        "Estimated delivery times",
        "Delivery notifications"
      ]
    },
    {
      title: "Fast & Reliable Delivery",
      description: "Fast and reliable delivery service ensuring your produce arrives fresh. We work with trusted delivery partners to get your orders to you quickly.",
      features: [
        "Fast delivery",
        "Freshness guarantee",
        "Delivery scheduling",
        "Package tracking"
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
              Our <span style={{color: 'hsl(var(--primary))'}}>Services</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
              Comprehensive solutions tailored for both farmers and customers, powered by advanced AI technology
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
                Services for Farmers
              </h2>
            </div>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Complete farm management solution with AI-powered tools designed to maximize productivity and efficiency
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
                Get Started as Farmer <ArrowRight className="ml-2 h-5 w-5" />
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
                Services for Customers
              </h2>
            </div>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Fresh produce marketplace connecting you directly with local farmers for quality guaranteed products
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
                Browse Store <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

