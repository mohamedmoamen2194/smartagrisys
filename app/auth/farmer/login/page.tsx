import { LoginForm } from "@/components/auth/login-form"
import { Leaf } from "lucide-react"
import Link from "next/link"

export default function FarmerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Leaf className="h-12 w-12 text-green-600 mr-2" />
            <span className="text-2xl font-bold">AgriSmart</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Farmer Login</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Access your farming dashboard and AI tools</p>
        </div>
        <LoginForm userType="farmer" />
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/auth/farmer/register" className="text-green-600 hover:text-green-500">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
