import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 gap-3 sm:gap-4">
            <Leaf className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-green-600" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
              Agri<span className="text-green-600">Smart</span>
            </h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
            Your comprehensive AI-powered platform connecting farmers with customers through smart agriculture
            technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Farmer Portal</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage your crops with AI-powered disease detection, fruit sizing, and crop recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <li>• AI Disease Detection</li>
                <li>• Fruit Sizing Analysis</li>
                <li>• Crop Recommendations</li>
                <li>• Inventory Management</li>
                <li>• Order Processing</li>
                <li>• Smart Chatbot Assistant</li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4 sm:p-6">
              <Button asChild className="w-full" size="default">
                <Link href="/auth/farmer/login">Farmer Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/farmer/register">Register as Farmer</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="mx-auto mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
                <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl">Customer Portal</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Shop fresh, quality produce directly from local farmers with guaranteed freshness
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <li>• Browse Fresh Produce</li>
                <li>• Quality Guaranteed Products</li>
                <li>• Secure Payment Processing</li>
                <li>• Order Tracking</li>
                <li>• Direct from Farm</li>
                <li>• Fast Delivery</li>
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4 sm:p-6">
              <Button asChild className="w-full" size="default" variant="secondary">
                <Link href="/auth/customer/login">Customer Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/customer/register">Register as Customer</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="text-center mt-8 sm:mt-12 lg:mt-16">
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 px-4 sm:px-0">
            Connecting farmers and customers through smart agriculture technology
          </p>
        </div>
      </div>
    </div>
  )
}
