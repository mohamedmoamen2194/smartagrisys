import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { headers } from 'next/headers'

type User = {
  id: string
  role: string
}

type OrderItem = {
  productId: string
  quantity: number
  price: number
}

type ShippingAddress = {
  id: number
  name: string
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

type CreateOrderRequest = {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  subtotal: number
  shipping: number
  total: number
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

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    const body: CreateOrderRequest = await request.json()
    const { items, shippingAddress, paymentMethod, subtotal, shipping, total } = body

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get product details and validate stock
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        farmer: true,
        inventoryItems: true
      }
    })

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Some products not found' }, { status: 404 })
    }

    // Validate stock availability
    for (const item of items) {
      const product = products.find(p => p.id === item.productId)
      if (!product) continue

      const inventory = product.inventoryItems[0]
      if (!inventory || inventory.quantity < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}` 
        }, { status: 400 })
      }
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          customerId: customer.id,
          farmerId: products[0].farmerId, // Assuming single farmer order
          status: 'PENDING',
          subtotal: subtotal,
          shippingCost: shipping,
          tax: 0, // You can add tax calculation logic here
          total: total,
          shippingAddress: shippingAddress,
          paymentStatus: paymentMethod === 'cash' ? 'PENDING' : 'PENDING',
          paymentMethod: paymentMethod,
          notes: `Payment method: ${paymentMethod}`
        }
      })

      // Create order items
      const orderItems = await Promise.all(
        items.map(item => 
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
              total: item.price * item.quantity
            }
          })
        )
      )

      // Update inventory (reserve the items)
      for (const item of items) {
        const product = products.find(p => p.id === item.productId)
        if (product && product.inventoryItems[0]) {
          await tx.inventoryItem.update({
            where: { id: product.inventoryItems[0].id },
            data: {
              quantity: {
                decrement: item.quantity
              },
              reservedQty: {
                increment: item.quantity
              }
            }
          })
        }
      }

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: total,
          currency: 'USD',
          status: paymentMethod === 'cash' ? 'PENDING' : 'PENDING',
          paymentMethod: paymentMethod
        }
      })

      return newOrder
    })

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: 'Order created successfully' 
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ 
      error: 'Failed to create order' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        farmer: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch orders' 
    }, { status: 500 })
  }
} 