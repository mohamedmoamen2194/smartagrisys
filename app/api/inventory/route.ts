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

export async function GET() {
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

    const inventory = await prisma.inventoryItem.findMany({
      where: {
        farmerId: farmer.id,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    console.log('Received inventory data:', data);

    const { productId, quantity, minThreshold, maxThreshold } = data;

    // Verify the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.error('Product not found:', productId);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log('Found product:', product);

    // Check if an inventory item already exists for this product
    const existingItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_farmerId: {
          productId,
          farmerId: farmer.id,
        },
      },
    });

    if (existingItem) {
      console.error('Inventory item already exists:', existingItem);
      return NextResponse.json(
        { error: 'An inventory item already exists for this product' },
        { status: 400 }
      );
    }

    // Create the inventory item
    const newInventoryItem = await prisma.inventoryItem.create({
      data: {
        productId,
        farmerId: farmer.id,
        quantity,
        minThreshold,
        maxThreshold,
      },
      include: {
        product: true,
      },
    });

    console.log('Created inventory item:', newInventoryItem);

    return NextResponse.json(newInventoryItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ 
      error: 'Failed to create inventory item',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 