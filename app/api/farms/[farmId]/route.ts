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

export async function GET(_req: Request, { params }: { params: Promise<{ farmId: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { farmId } = await params
  const farm = await assertFarmOwnership(user.id, farmId)
  if (!farm) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await prisma.farm.findUnique({
    where: { id: farm.id },
    include: { parts: { include: { sensors: { include: { sensor: true } }, predictions: true, insights: true } } },
  })
  return NextResponse.json(data)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ farmId: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { farmId } = await params
  const farm = await assertFarmOwnership(user.id, farmId)
  if (!farm) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, location, areaHa, metadata } = body ?? {}
  const updated = await prisma.farm.update({ where: { id: farm.id }, data: { name, location, areaHa, metadata } })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ farmId: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { farmId } = await params
  const farm = await assertFarmOwnership(user.id, farmId)
  if (!farm) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.farm.delete({ where: { id: farm.id } })
  return NextResponse.json({ ok: true })
}
