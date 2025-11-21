"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, HeartHandshake, TrendingUp, Users, Leaf, Zap, Shield } from "lucide-react"

export default function AboutUsPage() {
  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              About <span style={{color: 'hsl(var(--primary))'}}>AgriSmart</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
              Empowering the future of agriculture through intelligent technology and sustainable practices
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
                <CardTitle className="text-2xl mb-4">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  To empower farmers with cutting-edge AI technology and create a direct, transparent marketplace 
                  for fresh agricultural produce. We believe that technology should be accessible to all farmers, 
                  regardless of their farm size, and that consumers deserve access to fresh, quality produce directly 
                  from the source.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <HeartHandshake className="h-8 w-8" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <CardTitle className="text-2xl mb-4">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  To transform agriculture through intelligent automation, data-driven insights, and sustainable 
                  farming practices. We envision a world where every farmer has access to advanced tools that 
                  help them maximize yield, reduce waste, and protect the environment while ensuring food security 
                  for generations to come.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <TrendingUp className="h-8 w-8" style={{color: 'hsl(var(--primary))'}} />
                </div>
                <CardTitle className="text-2xl mb-4">Our Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Connecting farmers and customers through technology, ensuring quality produce reaches consumers 
                  while supporting sustainable agriculture. We're building a community where farmers can thrive, 
                  consumers can trust, and agriculture can evolve to meet the challenges of tomorrow.
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
              What We Do
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
                  <h3 className="text-xl font-bold mb-2">Smart Agriculture Solutions</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We provide comprehensive AI-powered tools that help farmers make data-driven decisions. 
                    From disease detection to crop recommendations, our platform leverages machine learning 
                    to optimize farming operations and increase productivity.
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
                  <h3 className="text-xl font-bold mb-2">Direct Marketplace</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We connect farmers directly with customers, eliminating middlemen and ensuring fair prices 
                    for both parties. Our platform provides a seamless shopping experience where customers can 
                    browse fresh produce, place orders, and track deliveries in real-time.
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
                  <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our advanced AI models analyze soil conditions, weather patterns, and crop health to provide 
                    actionable recommendations. Farmers receive personalized advice on planting, irrigation, 
                    fertilization, and pest management, all backed by scientific data.
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
                  <h3 className="text-xl font-bold mb-2">Sustainable Practices</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We're committed to promoting sustainable agriculture. Our tools help farmers reduce 
                    water usage, minimize chemical inputs, and optimize resource allocation, contributing 
                    to a healthier planet while maintaining high yields.
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
              Why Choose AgriSmart
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Proven Accuracy", desc: "Our AI models achieve 89-92% accuracy rates" },
              { title: "Easy to Use", desc: "Intuitive interface designed for farmers of all tech levels" },
              { title: "Direct Connection", desc: "Connect directly with customers, no middlemen" },
              { title: "Real-time Insights", desc: "Get instant recommendations and updates" },
              { title: "Comprehensive Tools", desc: "Everything you need in one platform" },
              { title: "24/7 Support", desc: "Our team is always here to help" }
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

