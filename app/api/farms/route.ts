import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

type User = { id: string; role: string }

async function getUser(): Promise<User | null> {
  try {
    const h = await headers()
    const auth = h.get('authorization')
    if (!auth) return null
    const user = JSON.parse(auth) as User
    return user?.id ? user : null
  } catch {
    return null
  }
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const farmer = await prisma.farmer.findUnique({ where: { userId: user.id } })
  if (!farmer) return NextResponse.json({ error: 'Farmer not found' }, { status: 404 })

  const farms = await prisma.farm.findMany({ where: { farmerId: farmer.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(farms)
}

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const farmer = await prisma.farmer.findUnique({ where: { userId: user.id } })
  if (!farmer) return NextResponse.json({ error: 'Farmer not found' }, { status: 404 })

  const body = await req.json()
  const { name, location, areaHa, metadata } = body ?? {}
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const farm = await prisma.farm.create({
    data: {
      name,
      location,
      areaHa,
      metadata,
      farmerId: farmer.id,
    },
  })
  return NextResponse.json(farm, { status: 201 })
}


