import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export { prisma }

// Database types based on our schema
export interface User {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: "FARMER" | "CUSTOMER" | "ADMIN"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Farmer {
  id: string
  userid: string
  farmname: string
  farmaddress: string
  farmsize?: number
  description?: string
  createdat: Date
  updatedat: Date
}

export interface Customer {
  id: string
  userid: string
  createdat: Date
  updatedat: Date
}

// Helper functions for database operations
export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "FARMER" | "CUSTOMER"
  phone?: string
  farmCountry?: string
  farmState?: string
}) {
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role,
      ...(userData.role === "FARMER"
        ? {
            farmer: {
              create: {
                farmName: `${userData.firstName}'s Farm`,
                farmAddress: "Address to be updated",
                farmCountry: userData.farmCountry,
                farmState: userData.farmState,
              },
            },
          }
        : {
            customer: {
              create: {},
            },
          }),
    },
    include: {
      farmer: true,
      customer: true,
    },
  })

  return user
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    // Filter by isActive in memory to avoid Prisma query issues
    return user && user.isActive ? user : null
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

export async function getUserWithProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        farmer: true,
        customer: true,
      },
    })

    if (!user || !user.isActive) return null

    const profile = user.role === "FARMER" ? user.farmer : user.customer
    return { user, profile }
  } catch (error) {
    console.error("Error getting user with profile:", error)
    throw error
  }
}

export async function updateFarmerProfile(
  userId: string,
  data: {
    farmName?: string
    farmAddress?: string
    farmSize?: number
    description?: string
  },
) {
  await prisma.farmer.update({
    where: {
      userId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  })
}
