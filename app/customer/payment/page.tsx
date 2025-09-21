"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, DollarSign, CheckCircle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

type PaymentMethod = "cash" | "credit"

interface ShippingAddress {
  id: number
  name: string
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function PaymentPage() {
  const router = useRouter()
  const { cartItems, getCartTotal, clearCart, loading: cartLoading } = useCart()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Get shipping address from localStorage
    const addressData = localStorage.getItem('selectedShippingAddress')
    if (addressData) {
      setShippingAddress(JSON.parse(addressData))
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    // Only redirect if we've initialized and there are no cart items
    if (isInitialized && !cartLoading && (!cartItems || cartItems.length === 0)) {
      router.push('/customer/cart')
    }
  }, [isInitialized, cartLoading, cartItems, router])

  const subtotal = getCartTotal()
  const shipping = 5.99
  const total = subtotal + shipping

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
  }

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method")
      return
    }

    if (!shippingAddress) {
      toast.error("Shipping address not found")
      return
    }

    setIsProcessing(true)

    try {
      const user = localStorage.getItem('user')
      if (!user) {
        toast.error("User not authenticated")
        return
      }

      // Create order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
        subtotal,
        shipping,
        total
      }

      // Send order to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': user
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const result = await response.json()
      
      // Clear cart after successful order
      clearCart()
      
      // Remove shipping address from localStorage
      localStorage.removeItem('selectedShippingAddress')
      
      toast.success("Order placed successfully!")
      
      // Redirect to order confirmation or orders page
      router.push(`/customer/orders?orderId=${result.orderId}`)
      
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading while cart is loading or not initialized
  if (cartLoading || !isInitialized) {
    return <div className="container mx-auto py-6">Loading...</div>
  }

  // Show loading while shipping address is loading
  if (!shippingAddress) {
    return <div className="container mx-auto py-6">Loading shipping address...</div>
  }

  // Don't render if no cart items (will redirect)
  if (!cartItems || cartItems.length === 0) {
    return <div className="container mx-auto py-6">Redirecting to cart...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Payment Method</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>Choose how you'd like to pay for your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPaymentMethod === "cash" 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => handlePaymentMethodSelect("cash")}
              >
                <CardContent className="flex items-center space-x-4 p-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <h3 className="font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-muted-foreground">Pay with cash when your order arrives</p>
                  </div>
                  {selectedPaymentMethod === "cash" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPaymentMethod === "credit" 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => handlePaymentMethodSelect("credit")}
              >
                <CardContent className="flex items-center space-x-4 p-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-medium">Credit/Debit Card</h3>
                    <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                  </div>
                  {selectedPaymentMethod === "credit" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Shipping Address Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium">{shippingAddress.fullName}</p>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                <p>{shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full" 
                size="lg" 
                disabled={!selectedPaymentMethod || isProcessing}
                onClick={handlePlaceOrder}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 