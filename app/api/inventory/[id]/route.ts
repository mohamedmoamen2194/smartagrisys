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
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

    const updatedInventory = await prisma.inventoryItem.update({
      where: {
        id,
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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Check if the inventory item exists for this farmer
    const item = await prisma.inventoryItem.findUnique({
      where: {
        id,
      },
    });
    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Delete the inventory item
    await prisma.inventoryItem.delete({
      where: {
        id,
      },
    });

    // Check if any inventory items remain for the product
    const remaining = await prisma.inventoryItem.count({
      where: { productId: item.productId }
    });
    if (remaining === 0) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { isActive: false }
      });
    }

    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    return NextResponse.json({ error: 'Failed to delete inventory' }, { status: 500 });
  }
} 