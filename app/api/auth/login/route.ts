import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth-utils"
import { getUserWithProfile } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, expectedRole } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user role matches the expected role for this login portal
    if (expectedRole && user.role !== expectedRole.toUpperCase()) {
      return NextResponse.json(
        {
          error: `Invalid credentials. This account is not registered as a ${expectedRole.toLowerCase()}.`,
        },
        { status: 401 },
      )
    }

    // Get user profile
    const userWithProfile = await getUserWithProfile(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        userType: user.role.toLowerCase(), // Add for compatibility
        profile: userWithProfile?.profile,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json(
        { error: "Database connection error. Please try again later." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : "Unknown error") : undefined },
      { status: 500 }
    )
  }
}
