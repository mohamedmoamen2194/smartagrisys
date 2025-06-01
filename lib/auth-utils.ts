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
    firstname: user.firstname,
    lastname: user.lastname,
    role: user.role,
  }
}

export async function registerUser(data: {
  email: string
  password: string
  firstname: string
  lastname: string
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
