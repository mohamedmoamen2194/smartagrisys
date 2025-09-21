import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { headers } from 'next/headers';

type User = {
  id: string;
  role: string;
};

type OrderGroup = {
  createdAt: Date;
  _sum: {
    total: number | null;
  };
};

type ExpenseGroup = {
  date: Date;
  _sum: {
    amount: number | null;
  };
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

    if (user.role === 'FARMER') {
      const farmer = await prisma.farmer.findUnique({
        where: { userId: user.id },
      });

      if (!farmer) {
        return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
      }

      // Get orders for the current year, delivered only
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1st of current year
      const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); // End of December

      const deliveredOrders = await prisma.order.findMany({
        where: {
          farmerId: farmer.id,
          status: 'DELIVERED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          total: true,
          createdAt: true
        }
      });

      // Aggregate revenue by month
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const monthlyRevenue = Array(12).fill(0);
      deliveredOrders.forEach(order => {
        const month = new Date(order.createdAt).getMonth();
        monthlyRevenue[month] += Number(order.total ?? 0);
      });

      // Build chart data
      const chartData = months.map((month, i) => ({
        name: month,
        sales: monthlyRevenue[i],
        expenses: 0 // You can add expenses if needed
      }));

      return NextResponse.json(chartData);
    }

    return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
} 