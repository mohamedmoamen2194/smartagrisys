import { PrismaClient, UserRole, ProductCategory, SensorType } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create sample farmer user
  const hashedPassword = await bcrypt.hash("password123", 10)

  const farmerUser = await prisma.user.create({
    data: {
      email: "farmer@example.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Smith",
      phone: "+1234567890",
      role: UserRole.FARMER,
    },
  })

  // Create farmer profile
  const farmer = await prisma.farmer.create({
    data: {
      userId: farmerUser.id,
      farmName: "Green Valley Farm",
      farmAddress: "123 Farm Road, Rural County, State 12345",
      farmSize: 50.5,
      description: "Organic farm specializing in fresh vegetables and fruits",
    },
  })

  // Create sample customer user
  const customerUser = await prisma.user.create({
    data: {
      email: "customer@example.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Doe",
      phone: "+1987654321",
      role: UserRole.CUSTOMER,
    },
  })

  // Create customer profile
  const customer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
    },
  })

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Fresh Apples",
        description: "Grade A organic apples, crisp and sweet",
        category: ProductCategory.FRUITS,
        price: 3.99,
        unit: "kg",
        farmerId: farmer.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Organic Tomatoes",
        description: "Freshly harvested organic tomatoes",
        category: ProductCategory.VEGETABLES,
        price: 4.29,
        unit: "kg",
        farmerId: farmer.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sweet Corn",
        description: "Locally grown sweet corn",
        category: ProductCategory.VEGETABLES,
        price: 2.49,
        unit: "piece",
        farmerId: farmer.id,
      },
    }),
  ])

  // Create inventory items
  for (const product of products) {
    await prisma.inventoryItem.create({
      data: {
        productId: product.id,
        farmerId: farmer.id,
        quantity: Math.floor(Math.random() * 200) + 50,
        minThreshold: 10,
        maxThreshold: 500,
      },
    })
  }

  // Create sample sensors
  const sensors = await Promise.all([
    prisma.sensor.create({
      data: {
        farmerId: farmer.id,
        name: "Field A Soil pH Sensor",
        type: SensorType.SOIL_PH,
        location: "Field A, Section 1",
      },
    }),
    prisma.sensor.create({
      data: {
        farmerId: farmer.id,
        name: "Field A Moisture Sensor",
        type: SensorType.SOIL_MOISTURE,
        location: "Field A, Section 1",
      },
    }),
    prisma.sensor.create({
      data: {
        farmerId: farmer.id,
        name: "Weather Station",
        type: SensorType.TEMPERATURE,
        location: "Central Weather Station",
      },
    }),
  ])

  // Create sample sensor readings
  for (const sensor of sensors) {
    for (let i = 0; i < 10; i++) {
      let value: number
      let unit: string

      switch (sensor.type) {
        case SensorType.SOIL_PH:
          value = 6.0 + Math.random() * 2 // pH 6.0-8.0
          unit = "pH"
          break
        case SensorType.SOIL_MOISTURE:
          value = 30 + Math.random() * 40 // 30-70%
          unit = "%"
          break
        case SensorType.TEMPERATURE:
          value = 15 + Math.random() * 20 // 15-35°C
          unit = "°C"
          break
        default:
          value = Math.random() * 100
          unit = "unit"
      }

      await prisma.sensorReading.create({
        data: {
          sensorId: sensor.id,
          value: value,
          unit: unit,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        },
      })
    }
  }

  // Create sample customer address
  await prisma.address.create({
    data: {
      customerId: customer.id,
      name: "Home",
      fullName: "Jane Doe",
      address: "456 Customer Street",
      city: "Customer City",
      state: "CS",
      zipCode: "12345",
      isDefault: true,
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log("👨‍🌾 Farmer login: farmer@example.com / password123")
  console.log("🛒 Customer login: customer@example.com / password123")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
