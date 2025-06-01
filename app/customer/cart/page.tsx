"use client"

import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Minus, Plus, Trash2, CreditCard } from "lucide-react"

const cartItemsStatic = [
  {
    id: 1,
    name: "Fresh Apples",
    description: "Grade A, Organic",
    price: 3.99,
    quantity: 2,
    unit: "kg",
    farmer: "John's Farm",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Sweet Corn",
    description: "Locally Grown",
    price: 2.49,
    quantity: 5,
    unit: "pieces",
    farmer: "Green Valley Farm",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Organic Tomatoes",
    description: "Freshly Harvested",
    price: 4.29,
    quantity: 1,
    unit: "kg",
    farmer: "Sunny Acres",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart()
  const subtotal = getCartTotal()
  const shipping = 5.99
  const total = subtotal + shipping

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
              {cartItems?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <p className="text-sm text-muted-foreground">From {item.farmer}</p>
                    <p className="font-medium">
                      ${item.price} per {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={loading}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input value={item.quantity} className="w-16 text-center" readOnly />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={loading}
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
              ))}
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
              <Button className="w-full" size="lg">
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
