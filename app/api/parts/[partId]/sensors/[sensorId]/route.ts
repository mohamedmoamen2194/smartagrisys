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
  return part
}

export async function POST(_req: Request, { params }: { params: { partId: string; sensorId: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const part = await assertPartOwnership(user.id, params.partId)
  if (!part) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // ensure sensor exists
  const sensor = await prisma.sensor.findUnique({ where: { id: params.sensorId } })
  if (!sensor) return NextResponse.json({ error: 'Sensor not found' }, { status: 404 })

  const link = await prisma.partSensor.upsert({
    where: { farmPartId_sensorId: { farmPartId: part.id, sensorId: sensor.id } },
    update: {},
    create: { farmPartId: part.id, sensorId: sensor.id },
  })
  return NextResponse.json(link, { status: 201 })
}

export async function DELETE(_req: Request, { params }: { params: { partId: string; sensorId: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const part = await assertPartOwnership(user.id, params.partId)
  if (!part) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.partSensor.delete({ where: { farmPartId_sensorId: { farmPartId: part.id, sensorId: params.sensorId } } })
  return NextResponse.json({ ok: true })
}


