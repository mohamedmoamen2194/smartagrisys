import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth-utils"
import { getUserWithProfile } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, password, expectedRole } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
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
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        userType: user.role.toLowerCase(), // Add for compatibility
        profile: userWithProfile?.profile,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
