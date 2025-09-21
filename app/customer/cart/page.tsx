"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-medium">
            {cartItems?.length} {cartItems?.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Cart Items</CardTitle>
              <CardDescription className="text-sm">Review your selected products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {cartItems?.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base mb-2">Your cart is empty</p>
                  <a href="/customer/shop" className="text-primary hover:underline text-sm sm:text-base">
                    Continue shopping
                  </a>
                </div>
              ) : (
                cartItems?.map((item, index) => {
                  const product = products[item.id]
                  const inventory = product?.inventoryItems[0]
                  const availableStock = inventory ? inventory.quantity - inventory.reservedQty : 0

                  return (
                    <div key={`${item.id}-${index}`} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
                      {/* Mobile Layout */}
                      <div className="sm:hidden space-y-3">
                        <div className="flex items-start space-x-3">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">From {item.farmer}</p>
                            <p className="font-medium text-sm">${item.price} per {item.unit}</p>
                            {inventory && (
                              <p className="text-xs text-muted-foreground">
                                {availableStock} {item.unit} available
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive p-1 h-8 w-8"
                            onClick={() => removeFromCart(item.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityUpdate(item, item.quantity - 1)}
                              disabled={loading || item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input value={item.quantity} className="w-12 h-8 text-center text-sm" readOnly />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityUpdate(item, item.quantity + 1)}
                              disabled={loading || !inventory || item.quantity >= availableStock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex sm:items-center sm:space-x-4 sm:w-full">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-20 w-20 rounded-md object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">From {item.farmer}</p>
                          <p className="font-medium">${item.price} per {item.unit}</p>
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
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-base sm:text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg" 
                disabled={cartItems?.length === 0} 
                onClick={() => router.push("/customer/shipping")}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Proceed to Checkout</span>
                <span className="sm:hidden">Checkout</span>
              </Button>
              
              {cartItems?.length === 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Add items to your cart to continue
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
