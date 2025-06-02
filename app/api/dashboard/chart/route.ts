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

      // Get orders grouped by month for the current year
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1); // January 1st of current year
      const endDate = new Date(currentYear, 11, 31); // December 31st of current year

      const orders = await prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          farmerId: farmer.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          total: true
        }
      }) as OrderGroup[];

      // Get expenses grouped by month for the current year
      const expenses = await prisma.expense.groupBy({
        by: ['date'],
        where: {
          farmerId: farmer.id,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      }) as ExpenseGroup[];

      // Transform data into monthly format
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];

      const chartData = months.map((month, index) => {
        const monthOrders = orders.filter((order: OrderGroup) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === index;
        });

        const monthExpenses = expenses.filter((expense: ExpenseGroup) => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === index;
        });

        return {
          name: month,
          sales: monthOrders.reduce((sum: number, order: OrderGroup) => sum + (order._sum?.total || 0), 0),
          expenses: monthExpenses.reduce((sum: number, expense: ExpenseGroup) => sum + (expense._sum?.amount || 0), 0)
        };
      });

      return NextResponse.json(chartData);
    }

    return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
} 