"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Leaf } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "@/hooks/useTranslations"

export default function FarmerRegisterPage() {
  const { t } = useTranslations()
  
  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundImage: 'linear-gradient(to bottom right, hsl(var(--secondary)/0.25), hsl(var(--accent)/0.25))'}}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Leaf className="h-12 w-12 mr-2" style={{color: 'hsl(var(--primary))'}} />
            <span className="text-2xl font-bold">{t("home.title")}</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("auth.farmerRegister")}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your farmer account to start selling</p>
        </div>
        <RegisterForm userType="farmer" />
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link href="/auth/farmer/login" className="text-green-600 hover:text-green-500">
              {t("auth.loginHere")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
