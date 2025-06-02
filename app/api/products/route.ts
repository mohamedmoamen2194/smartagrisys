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

interface ProductWithRelations {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
  farmerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  farmer: {
    id: string;
    farmName: string;
    user: {
      firstName: string;
      lastName: string;
    }
  };
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  inventoryItems: Array<{
    quantity: number;
    reservedQty: number;
  }>;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        images: true,
        inventoryItems: {
          select: {
            quantity: true,
            reservedQty: true,
          }
        },
      },
    });

    // Transform the response to match the expected format
    const transformedProducts = products.map((product: ProductWithRelations) => ({
      ...product,
      farmer: {
        id: product.farmer.id,
        farmName: product.farmer.farmName,
        name: `${product.farmer.user.firstName} ${product.farmer.user.lastName}`,
      }
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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
    const { name, description, category, price, unit } = data;

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        unit,
        farmerId: farmer.id,
        isActive: true,
      },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        images: true,
      },
    });

    // Transform the response to match the expected format
    const transformedProduct = {
      ...product,
      farmer: {
        id: product.farmer.id,
        farmName: product.farmer.farmName,
        name: `${product.farmer.user.firstName} ${product.farmer.user.lastName}`,
      }
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
} 