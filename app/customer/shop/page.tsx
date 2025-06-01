"use client"

import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, Filter, Leaf } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Fresh Apples",
    description: "Grade A, Organic",
    price: 3.99,
    unit: "kg",
    farmer: "John's Farm",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Sweet Corn",
    description: "Locally Grown",
    price: 2.49,
    unit: "piece",
    farmer: "Green Valley Farm",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Organic Tomatoes",
    description: "Freshly Harvested",
    price: 4.29,
    unit: "kg",
    farmer: "Sunny Acres",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Fresh Carrots",
    description: "Crisp and Sweet",
    price: 2.99,
    unit: "kg",
    farmer: "Valley Farm",
    inStock: false,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    name: "Bell Peppers",
    description: "Mixed Colors",
    price: 5.49,
    unit: "kg",
    farmer: "Rainbow Farm",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    name: "Fresh Lettuce",
    description: "Crispy Leaves",
    price: 1.99,
    unit: "head",
    farmer: "Green Leaf Farm",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function CustomerShopPage() {
  const { addToCart, getCartCount, loading } = useCart()

  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Fresh Produce</h1>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart ({getCartCount()})
        </Button>
      </div>

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

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
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
                  <div className="text-sm font-medium">{product.farmer}</div>
                  <div className="text-xs text-muted-foreground">Farmer</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!product.inStock || loading}
                variant={product.inStock ? "default" : "secondary"}
                onClick={() =>
                  product.inStock &&
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    unit: product.unit,
                    farmer: product.farmer,
                    image: product.image,
                  })
                }
              >
                {product.inStock ? (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {loading ? "Adding..." : "Add to Cart"}
                  </>
                ) : (
                  "Out of Stock"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
