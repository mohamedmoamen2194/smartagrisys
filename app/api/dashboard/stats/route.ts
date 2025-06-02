import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { headers } from 'next/headers';

type User = {
  id: string;
  role: string;
};

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

type OrderStats = {
  status: OrderStatus;
  _count: number;
  _sum: {
    total: number | null;
  } | null;
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

    const stats = {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      inTransitOrders: 0,
      deliveredOrders: 0,
      totalSpent: 0,
      inventoryItems: 0,
      lowStockItems: 0
    };

    if (user.role === 'FARMER') {
      const farmer = await prisma.farmer.findUnique({
        where: { userId: user.id },
      });

      if (!farmer) {
        return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
      }

      // Get order statistics
      const orders = await prisma.order.groupBy({
        by: ['status'],
        where: {
          farmerId: farmer.id
        },
        _count: true,
        _sum: {
          total: true
        }
      }) as OrderStats[];

      // Get inventory statistics
      const inventory = await prisma.inventoryItem.aggregate({
        where: {
          farmerId: farmer.id
        },
        _count: true,
        _sum: {
          quantity: true
        }
      });

      // Get low stock items count
      const lowStockItems = await prisma.inventoryItem.count({
        where: {
          farmerId: farmer.id,
          quantity: {
            lte: prisma.inventoryItem.fields.threshold
          }
        }
      });

      // Calculate statistics
      stats.totalRevenue = orders.reduce((sum: number, order: OrderStats) => sum + (order._sum?.total || 0), 0);
      stats.totalOrders = orders.reduce((sum: number, order: OrderStats) => sum + order._count, 0);
      stats.pendingOrders = orders.find((order: OrderStats) => order.status === 'PENDING')?._count || 0;
      stats.inTransitOrders = orders.find((order: OrderStats) => order.status === 'SHIPPED')?._count || 0;
      stats.deliveredOrders = orders.find((order: OrderStats) => order.status === 'DELIVERED')?._count || 0;
      stats.inventoryItems = inventory._count;
      stats.lowStockItems = lowStockItems;

    } else if (user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: user.id },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      // Get order statistics
      const orders = await prisma.order.groupBy({
        by: ['status'],
        where: {
          customerId: customer.id
        },
        _count: true,
        _sum: {
          total: true
        }
      }) as OrderStats[];

      // Calculate statistics
      stats.totalSpent = orders.reduce((sum: number, order: OrderStats) => sum + (order._sum?.total || 0), 0);
      stats.totalOrders = orders.reduce((sum: number, order: OrderStats) => sum + order._count, 0);
      stats.inTransitOrders = orders.find((order: OrderStats) => order.status === 'SHIPPED')?._count || 0;
      stats.deliveredOrders = orders.find((order: OrderStats) => order.status === 'DELIVERED')?._count || 0;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
} 