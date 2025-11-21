"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Leaf, 
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

export default function Home() {
  const sections = [
    {
      title: "About Us",
      description: "Learn about our mission to revolutionize agriculture through AI-powered solutions",
      icon: Users,
      href: "/about-us",
      image: "/placeholder.jpg",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Our Services",
      description: "Comprehensive solutions for farmers and customers with cutting-edge technology",
      icon: Package,
      href: "/services",
      image: "/placeholder.jpg",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Contact Us",
      description: "Get in touch with our team for support, questions, or partnership opportunities",
      icon: MessageSquare,
      href: "/contact-us",
      image: "/placeholder.jpg",
      color: "bg-purple-100 dark:bg-purple-900"
    }
  ]

  const features = [
    {
      icon: Brain,
      title: "AI Disease Detection",
      description: "Advanced MobileNetV2 model with 89% accuracy"
    },
    {
      icon: Sprout,
      title: "Smart Crop Recommendations",
      description: "Random Forest model with 92% accuracy"
    },
    {
      icon: Apple,
      title: "Fruit Sizing Analysis",
      description: "Automated quality assessment"
    },
    {
      icon: BarChart3,
      title: "AI Analytics Dashboard",
      description: "Real-time insights and performance tracking"
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
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-3">
              <div className="p-3 rounded-full bg-primary/10 animate-pulse">
                <Leaf className="h-10 w-10 sm:h-12 sm:w-12" style={{color: 'hsl(var(--primary))'}} />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Agri<span className="" style={{color: 'hsl(var(--primary))'}}>Smart</span>
              </h1>
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              A comprehensive solution that is
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
              {['Digital', 'Reliable', 'Consistent', 'Scalable'].map((word) => (
                <span 
                  key={word}
                  className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium"
                  style={{color: 'hsl(var(--primary))'}}
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6 px-4">
              Empowering farmers with cutting-edge AI technology to efficiently manage their farms and connect directly with customers through smart agriculture solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button size="default" className="text-sm px-6 py-2" asChild>
                <Link href="/auth/farmer/register">Get Started as Farmer</Link>
              </Button>
              <Button size="default" variant="outline" className="text-sm px-6 py-2" asChild>
                <Link href="/store">Browse Store</Link>
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
              Our Features
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced AI-powered tools designed to maximize productivity and ensure sustainable farming
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
              Explore Our Platform
            </h2>
            <div className="w-16 h-0.5 bg-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover more about what we offer and how we can help transform your agricultural operations
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
                      Learn More <ArrowRight className="ml-2 h-3 w-3" />
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
            Ready to Transform Your Agriculture Experience?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Join us today and discover how AgriSmart can revolutionize your farming operations or connect you with fresh, quality produce.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="default" className="text-sm px-6 py-2" asChild>
              <Link href="/auth/farmer/register">Start as Farmer</Link>
            </Button>
            <Button size="default" variant="outline" className="text-sm px-6 py-2" asChild>
              <Link href="/store">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
