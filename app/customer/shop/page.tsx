"use client"

import { useEffect, useMemo, useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Search, Filter, Leaf } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"

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

export default function CustomerShopPage() {
  const { t, locale } = useTranslations()
  const { addToCart, cartItems, getCartCount, loading } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currencyFormatter = useMemo(() => {
    const formatterLocale = locale === "ar" ? "ar-EG" : "en-EG"
    return new Intl.NumberFormat(formatterLocale, {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 2,
    })
  }, [locale])
  
  const getProductName = (product: Product): string => {
    if (locale === "ar" && (product as any).nameAr) return (product as any).nameAr
    return (product as any).nameEn || product.name || ""
  }

  const getProductDescription = (product: Product): string => {
    if (locale === "ar" && (product as any).descriptionAr) return (product as any).descriptionAr
    return (product as any).descriptionEn || product.description || ""
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        console.log('Products fetched:', data);
        console.log('Products with images:', data.filter((p: Product) => p.images && p.images.length > 0));
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
    return <div className="container mx-auto py-6">{t("customerShop.loadingProducts")}</div>
  }

  if (error) {
    return <div className="container mx-auto py-6 text-red-500">{t("customerShop.error")}: {error}</div>
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("customerShop.title")}</h1>
        <Button asChild>
          <a href="/customer/cart">
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t("customerShop.cart")} ({getCartCount()})
          </a>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("customerShop.searchProducts")} className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t("customerShop.filter")}
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const inventory = product.inventoryItems[0]
          const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
          const cartItem = cartItems.find(item => item.id === product.id)
          const availableStock = inventory ? inventory.quantity - inventory.reservedQty - (cartItem?.quantity || 0) : 0
          const imageSrc = primaryImage?.imageUrl || "/placeholder.svg"
          
          return (
            <Card key={product.id} className="overflow-hidden">
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
                    <Badge variant="destructive">{t("customerShop.outOfStock")}</Badge>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{getProductName(product)}</CardTitle>
                    <CardDescription>{getProductDescription(product)}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Leaf className="w-3 h-3 mr-1" />
                    {t("customerShop.fresh")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{currencyFormatter.format(product.price)}</div>
                    <div className="text-sm text-muted-foreground">{t("customerShop.per")} {product.unit}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{product.farmer.farmName}</div>
                    <div className="text-xs text-muted-foreground">{t("customerShop.farmer")}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {availableStock > 0 ? `${availableStock} ${product.unit} ${t("customerShop.available")}` : t("customerShop.outOfStock")}
                  {inventory && inventory.reservedQty > 0 && ` (${inventory.reservedQty} ${t("customerShop.reserved")})`}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={availableStock <= 0 || loading}
                  variant={availableStock > 0 ? "default" : "secondary"}
                  onClick={() =>
                    availableStock > 0 &&
                    addToCart({
                      id: product.id,
                      name: getProductName(product),
                      price: product.price,
                      unit: product.unit,
                      farmer: product.farmer.farmName,
                      image: primaryImage?.imageUrl,
                    })
                  }
                >
                  {availableStock > 0 ? (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {loading ? t("customerShop.adding") : t("customerShop.addToCart")}
                    </>
                  ) : (
                    t("customerShop.outOfStock")
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
