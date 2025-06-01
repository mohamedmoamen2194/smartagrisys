import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "FARMER" | "CUSTOMER"
  phone?: string
}) {
  const hashedPassword = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
    },
  })

  // Create role-specific profile
  if (data.role === "FARMER") {
    await prisma.farmer.create({
      data: {
        userId: user.id,
        farmName: `${data.firstName}'s Farm`,
        farmAddress: "",
      },
    })
  } else if (data.role === "CUSTOMER") {
    await prisma.customer.create({
      data: {
        userId: user.id,
      },
    })
  }

  return user
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      farmer: true,
      customer: true,
    },
  })

  if (!user || !(await verifyPassword(password, user.password))) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    farmer: user.farmer,
    customer: user.customer,
  }
}
