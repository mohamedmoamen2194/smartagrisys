import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">FarmTech Pro</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">Welcome to FarmTech Pro</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Advanced AI-powered farming solutions and marketplace. Revolutionize your agricultural practices with
            cutting-edge technology, smart analytics, and direct-to-consumer sales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/farmer/login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <Users className="mr-2 h-5 w-5" />
                Farmer Portal
              </Button>
            </Link>
            <Link href="/auth/customer/login">
              <Button size="lg" variant="outline">
                <BarChart3 className="mr-2 h-5 w-5" />
                Customer Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Agriculture
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover how our AI-powered platform can transform your farming operations and connect you with customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="mr-2 h-6 w-6 text-green-600" />
                  AI Crop Analysis
                </CardTitle>
                <CardDescription>Advanced disease detection and fruit sizing using computer vision</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload images of your crops to get instant AI-powered analysis for disease detection, fruit sizing,
                  and quality assessment.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/auth/farmer/register">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-6 w-6 text-blue-600" />
                  Smart Analytics
                </CardTitle>
                <CardDescription>Data-driven insights for better crop management decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Get personalized crop recommendations based on soil conditions, weather data, and historical
                  performance.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/auth/farmer/register">
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-6 w-6 text-purple-600" />
                  Direct Marketplace
                </CardTitle>
                <CardDescription>Connect directly with customers and sell your produce online</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Bypass middlemen and sell directly to consumers through our integrated marketplace platform.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/auth/customer/register">
                  <Button variant="outline" className="w-full">
                    Shop Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are already using FarmTech Pro to increase yields and connect with customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/farmer/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="text-xl font-bold">FarmTech Pro</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing agriculture with AI-powered solutions and direct-to-consumer marketplace.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Farmers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/farmer/login" className="hover:text-white">
                    Farmer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/auth/farmer/register" className="hover:text-white">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/customer/login" className="hover:text-white">
                    Shop Produce
                  </Link>
                </li>
                <li>
                  <Link href="/auth/customer/register" className="hover:text-white">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#contact" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FarmTech Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
