import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { headers } from 'next/headers'

type User = {
  id: string
  role: string
}

type Address = {
  name: string
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault?: boolean
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

// GET - Fetch all addresses for the customer
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get all addresses for this customer
    const addresses = await prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: { isDefault: 'desc' }
    })

    return NextResponse.json(addresses)

  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch addresses' 
    }, { status: 500 })
  }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    const body: Address = await request.json()
    const { name, fullName, address, city, state, zipCode, country, isDefault } = body

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // If this is the first address or isDefault is true, make it default
    const existingAddresses = await prisma.address.findMany({
      where: { customerId: customer.id }
    })

    const shouldBeDefault = isDefault || existingAddresses.length === 0

    // If making this address default, unset other defaults
    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false }
      })
    }

    // Create the new address
    const newAddress = await prisma.address.create({
      data: {
        customerId: customer.id,
        name,
        fullName,
        address,
        city,
        state,
        zipCode,
        country: country || 'United States',
        isDefault: shouldBeDefault
      }
    })

    return NextResponse.json({ 
      success: true, 
      address: newAddress,
      message: 'Address created successfully' 
    })

  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json({ 
      error: 'Failed to create address' 
    }, { status: 500 })
  }
}

// PUT - Update an existing address
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    const body = await request.json()
    const { id, name, fullName, address, city, state, zipCode, country, isDefault } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // If making this address default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { 
          customerId: customer.id,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    // Update the address
    const updatedAddress = await prisma.address.update({
      where: { 
        id,
        customerId: customer.id // Ensure customer can only update their own addresses
      },
      data: {
        name,
        fullName,
        address,
        city,
        state,
        zipCode,
        country: country || 'United States',
        isDefault
      }
    })

    return NextResponse.json({ 
      success: true, 
      address: updatedAddress,
      message: 'Address updated successfully' 
    })

  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ 
      error: 'Failed to update address' 
    }, { status: 500 })
  }
}

// DELETE - Delete an address
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check if this is the default address
    const addressToDelete = await prisma.address.findUnique({
      where: { id }
    })

    if (!addressToDelete) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Delete the address
    await prisma.address.delete({
      where: { 
        id,
        customerId: customer.id // Ensure customer can only delete their own addresses
      }
    })

    // If we deleted the default address, make another address default
    if (addressToDelete.isDefault) {
      const remainingAddresses = await prisma.address.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'asc' }
      })

      if (remainingAddresses.length > 0) {
        await prisma.address.update({
          where: { id: remainingAddresses[0].id },
          data: { isDefault: true }
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Address deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ 
      error: 'Failed to delete address' 
    }, { status: 500 })
  }
} 