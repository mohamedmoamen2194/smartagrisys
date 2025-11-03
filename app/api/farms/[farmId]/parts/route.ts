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

async function assertFarmOwnership(userId: string, farmId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer) return null
  const farm = await prisma.farm.findFirst({ where: { id: farmId, farmerId: farmer.id } })
  return farm
}

export async function POST(req: Request, { params }: { params: Promise<{ farmId: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { farmId } = await params
  const farm = await assertFarmOwnership(user.id, farmId)
  if (!farm) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, type, geometry, soilType, irrigationType, metadata } = body ?? {}
  if (!name || !geometry) return NextResponse.json({ error: 'name and geometry required' }, { status: 400 })
  const part = await prisma.farmPart.create({
    data: {
      name,
      type,
      geometry,
      soilType,
      irrigationType,
      metadata,
      farmId: farm.id,
    },
  })
  return NextResponse.json(part, { status: 201 })
}

export async function GET(_req: Request, { params }: { params: Promise<{ farmId: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { farmId } = await params
  const farm = await assertFarmOwnership(user.id, farmId)
  if (!farm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const parts = await prisma.farmPart.findMany({ where: { farmId: farm.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(parts)
}


