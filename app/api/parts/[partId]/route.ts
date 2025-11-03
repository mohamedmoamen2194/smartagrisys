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

async function assertPartOwnership(userId: string, partId: string) {
  const part = await prisma.farmPart.findUnique({ where: { id: partId } })
  if (!part) return null
  const farm = await prisma.farm.findUnique({ where: { id: part.farmId } })
  if (!farm) return null
  const farmer = await prisma.farmer.findUnique({ where: { userId } })
  if (!farmer || farmer.id !== farm.farmerId) return null
  return { part, farm }
}

export async function GET(_req: Request, { params }: { params: { partId: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const owned = await assertPartOwnership(user.id, params.partId)
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data = await prisma.farmPart.findUnique({
    where: { id: params.partId },
    include: { sensors: { include: { sensor: true } }, predictions: true, insights: true },
  })
  return NextResponse.json(data)
}

export async function PATCH(req: Request, { params }: { params: { partId: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const owned = await assertPartOwnership(user.id, params.partId)
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json()
  const { name, type, geometry, soilType, irrigationType, metadata } = body ?? {}
  const updated = await prisma.farmPart.update({ where: { id: params.partId }, data: { name, type, geometry, soilType, irrigationType, metadata } })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { partId: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const owned = await assertPartOwnership(user.id, params.partId)
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.farmPart.delete({ where: { id: params.partId } })
  return NextResponse.json({ ok: true })
}
