import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { headers } from 'next/headers';

type User = {
  id: string;
  role: string;
};

type OrderWithRelations = {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  customer: {
    name: string;
  };
  farmer: {
    name: string;
  };
  orderItems: Array<{
    quantity: number;
    product: {
      name: string;
    };
  }>;
};

async function getUserFromRequest(): Promise<User | null> {
  try {
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization) {
      return null;
    }

    const user = JSON.parse(authorization) as User;
    if (!user || !user.id) {
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

    let orders: OrderWithRelations[];
    if (user.role === 'FARMER') {
      const farmer = await prisma.farmer.findUnique({
        where: { userId: user.id },
      });

      if (!farmer) {
        return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
      }

      orders = await prisma.order.findMany({
        where: {
          farmerId: farmer.id
        },
        include: {
          customer: true,
          orderItems: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      // Transform the data for the frontend
      const transformedOrders = orders.map((order: OrderWithRelations) => ({
        id: order.orderNumber,
        customer: order.customer.name,
        product: order.orderItems[0]?.product.name + (order.orderItems.length > 1 ? ` (+${order.orderItems.length - 1} more)` : ''),
        quantity: order.orderItems.reduce((sum: number, item: { quantity: number; product: { name: string } }) => sum + item.quantity, 0),
        total: `$${order.total.toFixed(2)}`,
        status: order.status.toLowerCase(),
        date: order.createdAt.toISOString().split('T')[0]
      }));

      return NextResponse.json(transformedOrders);

    } else if (user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: user.id },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      orders = await prisma.order.findMany({
        where: {
          customerId: customer.id
        },
        include: {
          farmer: true,
          orderItems: {
            include: {
              product: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      // Transform the data for the frontend
      const transformedOrders = orders.map((order: OrderWithRelations) => ({
        id: order.orderNumber,
        customer: order.farmer.name,
        product: order.orderItems[0]?.product.name + (order.orderItems.length > 1 ? ` (+${order.orderItems.length - 1} more)` : ''),
        quantity: order.orderItems.reduce((sum: number, item: { quantity: number; product: { name: string } }) => sum + item.quantity, 0),
        total: `$${order.total.toFixed(2)}`,
        status: order.status.toLowerCase(),
        date: order.createdAt.toISOString().split('T')[0]
      }));

      return NextResponse.json(transformedOrders);
    }

    return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json({ error: 'Failed to fetch recent orders' }, { status: 500 });
  }
} 