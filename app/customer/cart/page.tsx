"use client"

import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, ArrowLeft } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, loading } = useCart()
  const subtotal = getCartTotal()
  const shipping = subtotal > 0 ? 5.99 : 0
  const total = subtotal + shipping

  const continueShopping = () => {
    router.push("/customer/shop")
  }

  const proceedToCheckout = () => {
    // For now, just show an alert - you can implement actual checkout later
    alert("Checkout functionality will be implemented soon!")
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <Button variant="outline" onClick={continueShopping}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some fresh produce to get started!</p>
            <Button onClick={continueShopping}>Start Shopping</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={continueShopping}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">{cartItems.length} items</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
              <CardDescription>Review your selected products</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
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
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      disabled={loading || item.quantity <= 1}
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
                <span>{subtotal > 0 ? `$${shipping.toFixed(2)}` : "Free"}</span>
              </div>
              {subtotal > 50 && <div className="text-sm text-green-600">🎉 Free shipping on orders over $50!</div>}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={proceedToCheckout}>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={continueShopping}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
