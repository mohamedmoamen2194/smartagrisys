import bcrypt from "bcryptjs"
import { getUserByEmail, createUser } from "./database"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email)

  if (!user || !(await verifyPassword(password, user.password))) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  }
}

export async function registerUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "FARMER" | "CUSTOMER"
  phone?: string
}) {
  // Check if user already exists
  const existingUser = await getUserByEmail(data.email)
  if (existingUser) {
    throw new Error("User already exists with this email")
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Create user
  return createUser({
    ...data,
    password: hashedPassword,
  })
}
