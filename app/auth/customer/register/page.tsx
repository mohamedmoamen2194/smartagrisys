import { RegisterForm } from "@/components/auth/register-form"
import { Leaf } from "lucide-react"
import Link from "next/link"

export default function CustomerRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Leaf className="h-12 w-12 text-green-600 mr-2" />
            <span className="text-2xl font-bold">AgriSmart</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Registration</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your account to shop fresh produce</p>
        </div>
        <RegisterForm userType="customer" />
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/customer/login" className="text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
