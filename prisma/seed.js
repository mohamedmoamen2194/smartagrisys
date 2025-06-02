const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create a farmer user
  const farmerPassword = await bcrypt.hash('password123', 10)
  const farmer = await prisma.user.create({
    data: {
      email: 'farmer@example.com',
      password: farmerPassword,
      firstName: 'John',
      lastName: 'Farmer',
      role: 'FARMER',
      farmer: {
        create: {
          farmName: "John's Farm",
          farmAddress: '123 Farm Road',
          farmSize: 50,
          description: 'A beautiful organic farm',
        },
      },
    },
    include: {
      farmer: true,
    },
  })

  // Create some products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Fresh Apples',
        description: 'Sweet and crispy apples freshly picked from our orchard',
        category: 'FRUITS',
        price: 2.99,
        unit: 'kg',
        farmerId: farmer.farmer.id,
        images: {
          create: {
            imageUrl: 'https://example.com/apples.jpg',
            altText: 'Fresh red apples',
            isPrimary: true,
          },
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Organic Tomatoes',
        description: 'Vine-ripened organic tomatoes',
        category: 'VEGETABLES',
        price: 3.99,
        unit: 'kg',
        farmerId: farmer.farmer.id,
        images: {
          create: {
            imageUrl: 'https://example.com/tomatoes.jpg',
            altText: 'Fresh organic tomatoes',
            isPrimary: true,
          },
        },
      },
    }),
  ])

  // Create inventory items for the products
  await Promise.all(
    products.map((product) =>
      prisma.inventoryItem.create({
        data: {
          productId: product.id,
          farmerId: farmer.farmer.id,
          quantity: 100,
          minThreshold: 10,
          maxThreshold: 200,
        },
      }),
    ),
  )

  console.log('Database has been seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 