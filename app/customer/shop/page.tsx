"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Filter, Leaf, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const products = [
  {
    id: 1,
    name: "Fresh Apples",
    description: "Grade A, Organic",
    price: 3.99,
    unit: "kg",
    farmer: "John's Farm",
    category: "Fruits",
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
    category: "Vegetables",
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
    category: "Vegetables",
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
    category: "Vegetables",
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
    category: "Vegetables",
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
    category: "Vegetables",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 7,
    name: "Bananas",
    description: "Sweet and Ripe",
    price: 2.29,
    unit: "kg",
    farmer: "Tropical Farm",
    category: "Fruits",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 8,
    name: "Strawberries",
    description: "Fresh Picked",
    price: 6.99,
    unit: "kg",
    farmer: "Berry Farm",
    category: "Fruits",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function CustomerShopPage() {
  const router = useRouter()
  const { addToCart, getCartCount, loading } = useCart()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10])
  const [showInStockOnly, setShowInStockOnly] = useState(false)

  // Get unique categories and farmers
  const categories = [...new Set(products.map((p) => p.category))]
  const farmers = [...new Set(products.map((p) => p.farmer))]

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesFarmer = selectedFarmers.length === 0 || selectedFarmers.includes(product.farmer)
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesStock = !showInStockOnly || product.inStock

      return matchesSearch && matchesCategory && matchesFarmer && matchesPrice && matchesStock
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handleFarmerChange = (farmer: string, checked: boolean) => {
    if (checked) {
      setSelectedFarmers([...selectedFarmers, farmer])
    } else {
      setSelectedFarmers(selectedFarmers.filter((f) => f !== farmer))
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedFarmers([])
    setPriceRange([0, 10])
    setShowInStockOnly(false)
    setSearchTerm("")
  }

  const navigateToCart = () => {
    router.push("/customer/cart")
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Fresh Produce</h1>
        <Button onClick={navigateToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart ({getCartCount()})
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {(selectedCategories.length > 0 || selectedFarmers.length > 0 || showInStockOnly) && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCategories.length + selectedFarmers.length + (showInStockOnly ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>Narrow down your search with these filters</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Categories */}
              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      />
                      <Label htmlFor={category}>{category}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Farmers */}
              <div>
                <h3 className="font-medium mb-3">Farmers</h3>
                <div className="space-y-2">
                  {farmers.map((farmer) => (
                    <div key={farmer} className="flex items-center space-x-2">
                      <Checkbox
                        id={farmer}
                        checked={selectedFarmers.includes(farmer)}
                        onCheckedChange={(checked) => handleFarmerChange(farmer, checked as boolean)}
                      />
                      <Label htmlFor={farmer}>{farmer}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h3 className="font-medium mb-3">Availability</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox id="in-stock" checked={showInStockOnly} onCheckedChange={setShowInStockOnly} />
                  <Label htmlFor="in-stock">In Stock Only</Label>
                </div>
              </div>

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {(selectedCategories.length > 0 || selectedFarmers.length > 0 || showInStockOnly) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleCategoryChange(category, false)}
            >
              {category} <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          {selectedFarmers.map((farmer) => (
            <Badge
              key={farmer}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => handleFarmerChange(farmer, false)}
            >
              {farmer} <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
          {showInStockOnly && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowInStockOnly(false)}>
              In Stock Only <X className="ml-1 h-3 w-3" />
            </Badge>
          )}
        </div>
      )}

      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredProducts.length} of {products.length} products
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No products found matching your criteria</div>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
