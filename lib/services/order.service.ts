import { 
  getOrderDB, 
  getProductDB, 
  getCustomerDB,
  getFarmerDB,
  getLogisticsDB
} from '../db'
import { Prisma } from '../../prisma/generated/order'
import { Prisma as ProductPrisma } from '../../prisma/generated/product'
import { Prisma as LogisticsPrisma } from '../../prisma/generated/logistics'

interface CreateOrderInput {
  customerId: string
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingAddressId: string
}

interface ProductDetail {
  product: ProductPrisma.ProductGetPayload<{}>
  quantity: number
}

interface AddressJson {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const orderDb = await getOrderDB()
    const productDb = await getProductDB()
    const customerDb = await getCustomerDB()
    const logisticsDb = await getLogisticsDB()

    // Start transactions in relevant databases
    const orderTx = await orderDb.$transaction(async (tx) => {
      // 1. Verify customer exists
      const customer = await customerDb.customer.findUnique({
        where: { id: input.customerId }
      })
      if (!customer) throw new Error('Customer not found')

      // 2. Verify products and calculate total
      let total = 0
      const productDetails: ProductDetail[] = []
      
      for (const item of input.items) {
        const product = await productDb.product.findUnique({
          where: { id: item.productId }
        })
        if (!product) throw new Error(`Product ${item.productId} not found`)
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`)
        }
        
        total += product.price * item.quantity
        productDetails.push({
          product,
          quantity: item.quantity
        })
      }

      // 3. Create order
      const order = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          customerId: input.customerId,
          farmerId: productDetails[0].product.farmerId, // Assuming single farmer order
          status: 'PENDING',
          paymentStatus: 'PENDING',
          total,
          items: {
            create: productDetails.map(({ product, quantity }) => ({
              productId: product.id,
              quantity,
              price: product.price
            }))
          }
        }
      })

      // 4. Update product stock
      for (const { product, quantity } of productDetails) {
        await productDb.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } }
        })
      }

      // 5. Create shipment record
      const address = await logisticsDb.address.findUnique({
        where: { id: input.shippingAddressId }
      })
      if (!address) throw new Error('Shipping address not found')

      const farmer = await getFarmerDB().then(db => 
        db.farmer.findUnique({
          where: { id: productDetails[0].product.farmerId }
        })
      )
      if (!farmer) throw new Error('Farmer not found')

      const deliveryAddress: AddressJson = {
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode
      }

      await logisticsDb.shipment.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          pickupAddress: farmer.location as any,
          deliveryAddress: deliveryAddress as any
        }
      })

      return order
    })

    return orderTx
  }
} 