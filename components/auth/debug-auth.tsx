"use client"

import { useEffect, useState } from "react"

export function DebugAuth() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }
  }, [])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs max-w-xs">
      <div>Auth Debug:</div>
      <div>User: {user ? user.email : "Not logged in"}</div>
      <div>Role: {user ? user.role : "None"}</div>
      <div>UserType: {user ? user.userType : "None"}</div>
    </div>
  )
}
