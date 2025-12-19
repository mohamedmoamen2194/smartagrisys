"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Leaf } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/hooks/useTranslations"

export default function CustomerRegisterPage() {
  const { t } = useTranslations()
  
  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundImage: 'linear-gradient(to bottom right, hsl(var(--secondary)/0.25), hsl(var(--accent)/0.25))'}}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Leaf className="h-12 w-12 mr-2" style={{color: 'hsl(var(--primary))'}} />
            <span className="text-2xl font-bold">{t("home.title")}</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("auth.customerRegister")}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your account to shop fresh produce</p>
        </div>
        <RegisterForm userType="customer" />
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/auth/customer/login" className="text-blue-600 hover:text-blue-500">
              {t("auth.loginHere")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
