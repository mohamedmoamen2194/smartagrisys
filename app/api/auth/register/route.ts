import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstname, lastname, role, phone } = await request.json()

    if (!email || !password || !firstname || !lastname || !role) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    if (!["FARMER", "CUSTOMER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const user = await registerUser({
      email,
      password,
      firstname,
      lastname,
      role,
      phone,
    })

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.message === "User already exists with this email") {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
