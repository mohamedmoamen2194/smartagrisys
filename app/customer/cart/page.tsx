"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface Product {
  id: string
  inventoryItems: Array<{
    quantity: number
    reservedQty: number
  }>
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart()
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        // Convert array to record for easier lookup
        const productsRecord = data.reduce((acc: Record<string, Product>, product: Product) => {
          acc[product.id] = product
          return acc
        }, {})
        setProducts(productsRecord)
      } catch (err) {
        console.error('Error fetching products:', err)
        toast.error('Failed to fetch product information')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleQuantityUpdate = (item: typeof cartItems[0], newQuantity: number) => {
    const product = products[item.id]
    if (!product) {
      toast.error('Product information not available')
      return
    }

    const inventory = product.inventoryItems[0]
    if (!inventory) {
      toast.error('Inventory information not available')
      return
    }

    const availableStock = inventory.quantity - inventory.reservedQty
    if (newQuantity > availableStock) {
      toast.error(`Only ${availableStock} units available`)
      return
    }

    updateQuantity(item.id, newQuantity)
  }

  const subtotal = getCartTotal()
  const shipping = 5.99
  const total = subtotal + shipping

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading cart...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="font-medium">{cartItems?.length} items</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
              <CardDescription>Review your selected products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Your cart is empty. <a href="/customer/shop" className="text-primary hover:underline">Continue shopping</a>
                </div>
              ) : (
                cartItems?.map((item) => {
                  const product = products[item.id]
                  const inventory = product?.inventoryItems[0]
                  const availableStock = inventory ? inventory.quantity - inventory.reservedQty : 0

                  return (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">From {item.farmer}</p>
                        <p className="font-medium">
                          ${item.price} per {item.unit}
                        </p>
                        {inventory && (
                          <p className="text-sm text-muted-foreground">
                            {availableStock} {item.unit} available
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityUpdate(item, item.quantity - 1)}
                          disabled={loading || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input value={item.quantity} className="w-16 text-center" readOnly />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityUpdate(item, item.quantity + 1)}
                          disabled={loading || !inventory || item.quantity >= availableStock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => removeFromCart(item.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" disabled={cartItems?.length === 0}>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
