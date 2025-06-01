import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Database types based on our schema
export interface User {
  id: string
  email: string
  password: string
  firstname: string
  lastname: string
  phone?: string
  role: "FARMER" | "CUSTOMER" | "ADMIN"
  isactive: boolean
  createdat: Date
  updatedat: Date
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
  firstname: string
  lastname: string
  role: "FARMER" | "CUSTOMER"
  phone?: string
}) {
  const userId = crypto.randomUUID()

  const [user] = await sql`
    INSERT INTO users (id, email, password, firstname, lastname, phone, role)
    VALUES (${userId}, ${userData.email}, ${userData.password}, ${userData.firstname}, ${userData.lastname}, ${userData.phone || null}, ${userData.role})
    RETURNING *
  `

  // Create role-specific profile
  if (userData.role === "FARMER") {
    const farmerId = crypto.randomUUID()
    await sql`
      INSERT INTO farmers (id, userid, farmname, farmaddress)
      VALUES (${farmerId}, ${userId}, ${userData.firstname + "'s Farm"}, ${"Address to be updated"})
    `
  } else if (userData.role === "CUSTOMER") {
    const customerId = crypto.randomUUID()
    await sql`
      INSERT INTO customers (id, userid)
      VALUES (${customerId}, ${userId})
    `
  }

  return user
}

export async function getUserByEmail(email: string) {
  const [user] = await sql`
    SELECT * FROM users WHERE email = ${email} AND isactive = true
  `
  return user as User | undefined
}

export async function getUserWithProfile(userId: string) {
  const [user] = await sql`
    SELECT * FROM users WHERE id = ${userId} AND isactive = true
  `

  if (!user) return null

  let profile = null
  if (user.role === "FARMER") {
    const [farmer] = await sql`
      SELECT * FROM farmers WHERE userid = ${userId}
    `
    profile = farmer
  } else if (user.role === "CUSTOMER") {
    const [customer] = await sql`
      SELECT * FROM customers WHERE userid = ${userId}
    `
    profile = customer
  }

  return { user: user as User, profile }
}

export async function updateFarmerProfile(
  userId: string,
  data: {
    farmname?: string
    farmaddress?: string
    farmsize?: number
    description?: string
  },
) {
  const updates = Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(", ")

  if (updates) {
    await sql`
      UPDATE farmers 
      SET ${sql.unsafe(updates)}, updatedat = CURRENT_TIMESTAMP
      WHERE userid = ${userId}
    `
  }
}
