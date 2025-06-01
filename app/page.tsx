import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-16 w-16 text-green-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              Agri<span className="text-green-600">Smart</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your comprehensive AI-powered platform connecting farmers with customers through smart agriculture
            technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Farmer Portal</CardTitle>
              <CardDescription className="text-base">
                Manage your crops with AI-powered disease detection, fruit sizing, and crop recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• AI Disease Detection</li>
                <li>• Fruit Sizing Analysis</li>
                <li>• Crop Recommendations</li>
                <li>• Inventory Management</li>
                <li>• Order Processing</li>
                <li>• Smart Chatbot Assistant</li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/auth/farmer/login">Farmer Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/farmer/register">Register as Farmer</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Customer Portal</CardTitle>
              <CardDescription className="text-base">
                Shop fresh, quality produce directly from local farmers with guaranteed freshness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Browse Fresh Produce</li>
                <li>• Quality Guaranteed Products</li>
                <li>• Secure Payment Processing</li>
                <li>• Order Tracking</li>
                <li>• Direct from Farm</li>
                <li>• Fast Delivery</li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full" size="lg" variant="secondary">
                <Link href="/auth/customer/login">Customer Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/customer/register">Register as Customer</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500 dark:text-gray-400">
            Connecting farmers and customers through smart agriculture technology
          </p>
        </div>
      </div>
    </div>
  )
}
