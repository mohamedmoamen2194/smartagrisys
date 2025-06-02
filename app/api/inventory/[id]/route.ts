import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { headers } from 'next/headers';

async function getUserFromRequest() {
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return null;
    }

    const user = JSON.parse(authorization);
    if (!user || user.role !== 'FARMER' || !user.id) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.id },
    });

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    const data = await request.json();
    const { quantity, minThreshold, maxThreshold } = data;

    const updatedInventory = await prisma.inventoryItem.update({
      where: {
        id: params.id,
        farmerId: farmer.id,
      },
      data: {
        quantity,
        minThreshold,
        maxThreshold,
      },
    });

    return NextResponse.json(updatedInventory);
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.id },
    });

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 });
    }

    await prisma.inventoryItem.delete({
      where: {
        id: params.id,
        farmerId: farmer.id,
      },
    });

    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    return NextResponse.json({ error: 'Failed to delete inventory' }, { status: 500 });
  }
} 