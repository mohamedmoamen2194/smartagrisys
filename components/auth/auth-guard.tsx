"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole: "farmer" | "customer"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem("user")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)

        // Check both role and userType for compatibility
        const userRole = user.role || user.userType?.toUpperCase()
        const expectedRole = requiredRole.toUpperCase()

        if (userRole !== expectedRole) {
          router.push("/")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check error:", error)
        localStorage.removeItem("user") // Clear invalid data
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to ensure localStorage is available
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [requiredRole, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
