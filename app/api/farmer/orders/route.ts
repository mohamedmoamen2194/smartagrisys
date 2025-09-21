import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { headers } from 'next/headers'

type User = {
  id: string
  role: string
}

async function getUserFromRequest(): Promise<User | null> {
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    
    if (!authHeader) {
      return null
    }

    const user = JSON.parse(authHeader)
    return user
  } catch (error) {
    console.error('Error parsing user from request:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    // Get farmer details
    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.id }
    })

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 })
    }

    // Get orders for this farmer
    const orders = await prisma.order.findMany({
      where: { farmerId: farmer.id },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)

  } catch (error) {
    console.error('Error fetching farmer orders:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch orders' 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    // Get farmer details
    const farmer = await prisma.farmer.findUnique({
      where: { userId: user.id }
    })

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 })
    }

    // Get the current order to check if we're rejecting it
    const currentOrder = await prisma.order.findUnique({
      where: { 
        id: orderId,
        farmerId: farmer.id
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                inventoryItems: true
              }
            }
          }
        }
      }
    })

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status and handle inventory restoration for rejected orders
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If the order is being cancelled/rejected, restore inventory
      if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
        for (const orderItem of currentOrder.orderItems) {
          const inventory = orderItem.product.inventoryItems[0]
          if (inventory) {
            await tx.inventoryItem.update({
              where: { id: inventory.id },
              data: {
                quantity: {
                  increment: orderItem.quantity
                },
                reservedQty: {
                  decrement: orderItem.quantity
                }
              }
            })
          }
        }
      }

      // Update the order status
      const updated = await tx.order.update({
        where: { 
          id: orderId,
          farmerId: farmer.id
        },
        data: { status },
        include: {
          customer: {
            include: {
              user: true
            }
          },
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

      return updated
    })

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: status === 'CANCELLED' ? 'Order cancelled and inventory restored' : 'Order status updated successfully' 
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ 
      error: 'Failed to update order status' 
    }, { status: 500 })
  }
} 