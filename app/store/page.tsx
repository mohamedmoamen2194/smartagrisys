"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Leaf, LogIn } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: string
  farmer: {
    farmName: string
  }
  inventoryItems: Array<{
    quantity: number
    reservedQty: number
  }>
  images: Array<{
    imageUrl: string
    isPrimary: boolean
  }>
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    setIsLoggedIn(!!user)

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 lg:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">Loading products...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 lg:pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-red-500">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      {/* Header Section */}
      <section className="py-12 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              Our <span style={{color: 'hsl(var(--primary))'}}>Store</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
              Browse fresh, quality produce directly from local farmers
            </p>
            {!isLoggedIn && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Please login to add items to cart and place orders
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/auth/customer/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Customer Login
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/auth/customer/register">Register</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const inventory = product.inventoryItems[0]
                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
                const availableStock = inventory ? inventory.quantity - inventory.reservedQty : 0
                const imageSrc = primaryImage?.imageUrl || "/placeholder.svg"
                
                // Debug logging
                if (product.images && product.images.length > 0) {
                  console.log(`Product ${product.name} has ${product.images.length} images:`, product.images)
                  console.log(`Using image URL:`, imageSrc)
                } else {
                  console.warn(`Product ${product.name} has no images`)
                }
                
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.error(`Failed to load image for ${product.name}:`, imageSrc)
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      {availableStock <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="text-sm">{product.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Leaf className="w-3 h-3 mr-1" />
                          Fresh
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold">${product.price}</div>
                          <div className="text-sm text-muted-foreground">per {product.unit}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{product.farmer.farmName}</div>
                          <div className="text-xs text-muted-foreground">Farmer</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {availableStock > 0 ? `${availableStock} ${product.unit} available` : 'Out of stock'}
                        {inventory && inventory.reservedQty > 0 && ` (${inventory.reservedQty} reserved)`}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {isLoggedIn ? (
                        <Button
                          className="w-full"
                          disabled={availableStock <= 0}
                          variant={availableStock > 0 ? "default" : "secondary"}
                          asChild
                        >
                          <Link href="/customer/shop">
                            {availableStock > 0 ? "View in Shop" : "Out of Stock"}
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          variant="outline"
                          asChild
                        >
                          <Link href="/auth/customer/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            Login to Order
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

