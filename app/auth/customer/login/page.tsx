"use client"

import type React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

type LoginFormProps = {}

const LoginForm: React.FC<LoginFormProps> = () => {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  return (
    <div>
      <h1>Customer Login</h1>
      <p>Callback URL: {callbackUrl}</p>
      {/* Add your login form here */}
    </div>
  )
}

const CustomerLoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

export default CustomerLoginPage
