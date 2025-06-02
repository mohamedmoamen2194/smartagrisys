import { PrismaClient as CustomerDB } from '../../prisma/generated/customer'
import { PrismaClient as ProductDB } from '../../prisma/generated/product'
import { PrismaClient as OrderDB } from '../../prisma/generated/order'
import { PrismaClient as FarmerDB } from '../../prisma/generated/farmer'
import { PrismaClient as SensorDB } from '../../prisma/generated/sensor'
import { PrismaClient as ImageDB } from '../../prisma/generated/image'
import { PrismaClient as LogisticsDB } from '../../prisma/generated/logistics'

// Database connection manager
class DatabaseManager {
  private static instance: DatabaseManager
  private connections: Map<string, any> = new Map()

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async getConnection(dbName: string) {
    if (!this.connections.has(dbName)) {
      let client
      switch (dbName) {
        case 'customer':
          client = new CustomerDB()
          break
        case 'product':
          client = new ProductDB()
          break
        case 'order':
          client = new OrderDB()
          break
        case 'farmer':
          client = new FarmerDB()
          break
        case 'sensor':
          client = new SensorDB()
          break
        case 'image':
          client = new ImageDB()
          break
        case 'logistics':
          client = new LogisticsDB()
          break
        default:
          throw new Error(`Unknown database: ${dbName}`)
      }
      this.connections.set(dbName, client)
    }
    return this.connections.get(dbName)
  }

  async disconnect(dbName: string) {
    const client = this.connections.get(dbName)
    if (client) {
      await client.$disconnect()
      this.connections.delete(dbName)
    }
  }

  async disconnectAll() {
    for (const [dbName] of this.connections) {
      await this.disconnect(dbName)
    }
  }
}

// Export a singleton instance
export const dbManager = DatabaseManager.getInstance()

// Type-safe database getters
export const getCustomerDB = () => dbManager.getConnection('customer') as Promise<CustomerDB>
export const getProductDB = () => dbManager.getConnection('product') as Promise<ProductDB>
export const getOrderDB = () => dbManager.getConnection('order') as Promise<OrderDB>
export const getFarmerDB = () => dbManager.getConnection('farmer') as Promise<FarmerDB>
export const getSensorDB = () => dbManager.getConnection('sensor') as Promise<SensorDB>
export const getImageDB = () => dbManager.getConnection('image') as Promise<ImageDB>
export const getLogisticsDB = () => dbManager.getConnection('logistics') as Promise<LogisticsDB> 