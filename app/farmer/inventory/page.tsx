"use client"

import { useEffect, useMemo, useState, ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FarmerPageHeader } from "@/components/farmer/page-header"
import { useTranslations } from "@/hooks/useTranslations"

interface Product {
  id: string
  name: string
  nameEn?: string
  nameAr?: string
  description?: string
  descriptionEn?: string
  descriptionAr?: string
  category: string
  price: number
  unit: string
}

interface InventoryItem {
  id: string
  product: Product
  quantity: number
  reservedQty: number
  minThreshold: number
  maxThreshold: number
  lastUpdated: string
}

interface EditDialogProps {
  item: InventoryItem
  onSave: (id: string, data: { quantity: number; minThreshold: number; maxThreshold: number }) => Promise<void>
}

interface AddDialogProps {
  onAdd: (data: { productId: string; quantity: number; minThreshold: number; maxThreshold: number }) => Promise<void>
}

type Status = "in-stock" | "low-stock" | "out-of-stock"

function AddDialog({ onAdd }: AddDialogProps) {
  const { t } = useTranslations()
  // Product fields - bilingual
  const [nameEn, setNameEn] = useState("")
  const [nameAr, setNameAr] = useState("")
  const [descriptionEn, setDescriptionEn] = useState("")
  const [descriptionAr, setDescriptionAr] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState(0)
  const [unit, setUnit] = useState("")
  // Image upload
  const [images, setImages] = useState<File[]>([])
  // Inventory fields
  const [quantity, setQuantity] = useState(0)
  const [minThreshold, setMinThreshold] = useState(10)
  const [maxThreshold, setMaxThreshold] = useState(1000)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleAdd = async () => {
    if ((!nameEn && !nameAr) || !category || !price || !unit) {
      toast.error(t("inventory.fillRequiredFields"))
      return
    }

    if (quantity <= 0) {
      toast.error(t("inventory.quantityMustBeGreater"))
      return
    }

    try {
      setLoading(true)
      const userStr = localStorage.getItem("user")
      if (!userStr) throw new Error(t("inventory.pleaseLoginAgain"))
      // First create the product
      const productResponse = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userStr,
        },
        body: JSON.stringify({
          nameEn: nameEn || undefined,
          nameAr: nameAr || undefined,
          descriptionEn: descriptionEn || undefined,
          descriptionAr: descriptionAr || undefined,
          category,
          price,
          unit
        }),
      })
      if (!productResponse.ok) throw new Error('Failed to create product')
      const product = await productResponse.json()
      // Upload images if any
      if (images.length > 0) {
        console.log('Uploading', images.length, 'images for product', product.id);
        const formData = new FormData()
        images.forEach((file) => formData.append('images', file))
        const imageResponse = await fetch(`/api/products/${product.id}/images`, {
          method: 'POST',
          headers: {
            'Authorization': userStr
          },
          body: formData
        })
        if (!imageResponse.ok) {
          console.error('Failed to upload images:', await imageResponse.text());
        } else {
          const imageResult = await imageResponse.json();
          console.log('Images uploaded successfully:', imageResult);
        }
      }
      // Then add it to inventory
      await onAdd({
        productId: product.id,
        quantity,
        minThreshold,
        maxThreshold
      })
      setIsOpen(false)
      // Reset form
      setNameEn("")
      setNameAr("")
      setDescriptionEn("")
      setDescriptionAr("")
      setCategory("")
      setPrice(0)
      setUnit("")
      setQuantity(0)
      setImages([])
      toast.success(t("inventory.productAddedSuccess"))
    } catch (error) {
      toast.error(t("inventory.productAddedError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t("inventory.addNewItem")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("inventory.addProductToInventory")}</DialogTitle>
          <DialogDescription>{t("inventory.addProductDescription")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nameEn" className="text-right">
              {t("inventory.productNameEn")}
            </Label>
            <Input
              id="nameEn"
              value={nameEn}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNameEn(e.target.value)}
              className="col-span-3"
              placeholder="Enter product name in English"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nameAr" className="text-right">
              {t("inventory.productNameAr")}
            </Label>
            <Input
              id="nameAr"
              value={nameAr}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNameAr(e.target.value)}
              className="col-span-3"
              placeholder="أدخل اسم المنتج بالعربية"
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descriptionEn" className="text-right">
              {t("inventory.descriptionEn")}
            </Label>
            <Input
              id="descriptionEn"
              value={descriptionEn}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDescriptionEn(e.target.value)}
              className="col-span-3"
              placeholder="Enter description in English"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descriptionAr" className="text-right">
              {t("inventory.descriptionAr")}
            </Label>
            <Input
              id="descriptionAr"
              value={descriptionAr}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDescriptionAr(e.target.value)}
              className="col-span-3"
              placeholder="أدخل الوصف بالعربية"
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              {t("inventory.category")}
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("inventory.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FRUITS">{t("categories.fruits")}</SelectItem>
                <SelectItem value="VEGETABLES">{t("categories.vegetables")}</SelectItem>
                <SelectItem value="GRAINS">{t("categories.grains")}</SelectItem>
                <SelectItem value="HERBS">{t("categories.herbs")}</SelectItem>
                <SelectItem value="DAIRY">{t("categories.dairy")}</SelectItem>
                <SelectItem value="OTHER">{t("categories.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              {t("inventory.price")}
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              {t("inventory.unit")}
            </Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUnit(e.target.value)}
              placeholder={t("inventory.unitPlaceholder")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="images" className="text-right">
              {t("inventory.productImages")}
            </Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              {t("inventory.initialQuantity")}
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minThreshold" className="text-right">
              {t("inventory.minThreshold")}
            </Label>
            <Input
              id="minThreshold"
              type="number"
              value={minThreshold}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMinThreshold(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxThreshold" className="text-right">
              {t("inventory.maxThreshold")}
            </Label>
            <Input
              id="maxThreshold"
              type="number"
              value={maxThreshold}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxThreshold(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? t("inventory.adding") : t("inventory.addToInventory")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({ item, onSave }: EditDialogProps) {
  const { t } = useTranslations()
  const [quantity, setQuantity] = useState(item.quantity)
  const [minThreshold, setMinThreshold] = useState(item.minThreshold)
  const [maxThreshold, setMaxThreshold] = useState(item.maxThreshold)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      await onSave(item.id, { quantity, minThreshold, maxThreshold })
      setIsOpen(false)
      toast.success(t("inventory.inventoryUpdatedSuccess"))
    } catch (error) {
      toast.error(t("inventory.inventoryUpdatedError"))
    } finally {
      setLoading(false)
    }
  }

  const productName = item.product.nameEn || item.product.nameAr || item.product.name || ""

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("inventory.editInventory")}</DialogTitle>
          <DialogDescription>{t("inventory.updateInventory")} {productName}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              {t("inventory.quantity")}
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minThreshold" className="text-right">
              {t("inventory.minThreshold")}
            </Label>
            <Input
              id="minThreshold"
              type="number"
              value={minThreshold}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMinThreshold(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxThreshold" className="text-right">
              {t("inventory.maxThreshold")}
            </Label>
            <Input
              id="maxThreshold"
              type="number"
              value={maxThreshold}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxThreshold(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? t("inventory.saving") : t("inventory.saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function InventoryPage() {
  const { t, locale } = useTranslations()
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const currencyFormatter = useMemo(() => {
    const formatterLocale = locale === "ar" ? "ar-EG" : "en-EG"
    return new Intl.NumberFormat(formatterLocale, {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 2,
    })
  }, [locale])

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        setError(t("inventory.pleaseLoginAgain"))
        return
      }

      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': userStr,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch inventory')
      }
      const data = await response.json()
      setInventoryItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("inventory.failedToFetch"))
      toast.error(t("inventory.failedToFetch"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleAddInventory = async (data: { productId: string; quantity: number; minThreshold: number; maxThreshold: number }) => {
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Please log in again")
      }

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userStr,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to add inventory')
      }

      await fetchInventory()
    } catch (error) {
      console.error('Error adding inventory:', error)
      throw error
    }
  }

  const handleUpdateInventory = async (id: string, data: { quantity: number; minThreshold: number; maxThreshold: number }) => {
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Please log in again")
      }

      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userStr,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update inventory')
      }

      await fetchInventory()
    } catch (error) {
      console.error('Error updating inventory:', error)
      throw error
    }
  }

  const handleDeleteInventory = async (id: string) => {
    if (!confirm(t("inventory.deleteConfirm"))) {
      return
    }

    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Please log in again")
      }

      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': userStr,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete inventory')
      }

      await fetchInventory()
      toast.success(t("inventory.inventoryDeletedSuccess"))
    } catch (error) {
      console.error('Error deleting inventory:', error)
      toast.error(t("inventory.inventoryDeletedError"))
    }
  }

  const getStatus = (quantity: number, minThreshold: number): Status => {
    if (quantity <= 0) return "out-of-stock"
    if (quantity <= minThreshold) return "low-stock"
    return "in-stock"
  }

  const getStatusLabel = (status: Status): string => {
    switch (status) {
      case "in-stock":
        return t("inventory.inStockStatus")
      case "low-stock":
        return t("inventory.lowStockStatus")
      case "out-of-stock":
        return t("inventory.outOfStockStatus")
    }
  }

  const getProductName = (product: Product): string => {
    if (locale === "ar" && product.nameAr) return product.nameAr
    return product.nameEn || product.name || ""
  }

  const filteredItems = searchQuery
    ? inventoryItems.filter(item => {
        const name = getProductName(item.product)
        return name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : inventoryItems

  if (isLoading) {
    return <div className="w-full px-4 sm:px-6 lg:px-8 py-6">{t("common.loading")}</div>
  }

  if (error) {
    return <div className="w-full px-4 sm:px-6 lg:px-8 py-6 text-red-500">{t("common.error")}: {error}</div>
  }

  const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockCount = inventoryItems.filter(item => item.quantity > 0 && item.quantity <= item.minThreshold).length
  const outOfStockCount = inventoryItems.filter(item => item.quantity <= 0).length
  const inStockCount = inventoryItems.filter(item => item.quantity > item.minThreshold).length

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <FarmerPageHeader title={t("inventory.title")} actions={<AddDialog onAdd={handleAddInventory} />} />

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("inventory.totalProducts")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">{t("inventory.totalInventoryItems")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("inventory.inStock")}</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inStockCount}</div>
            <p className="text-xs text-muted-foreground">{t("inventory.productsAvailable")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("inventory.lowStock")}</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">{t("inventory.needsRestocking")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("inventory.outOfStock")}</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">{t("inventory.requiresAttention")}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("inventory.inventoryItems")}</CardTitle>
          <CardDescription>{t("inventory.manageInventory")}</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("inventory.searchProducts")}
                className="pl-10"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory.product")}</TableHead>
                  <TableHead>{t("inventory.category")}</TableHead>
                  <TableHead className="text-right">{t("inventory.quantity")}</TableHead>
                  <TableHead className="text-right">{t("inventory.reserved")}</TableHead>
                  <TableHead className="text-right">{t("inventory.available")}</TableHead>
                  <TableHead className="text-right">{t("inventory.price")}</TableHead>
                  <TableHead>{t("inventory.status")}</TableHead>
                  <TableHead>{t("inventory.lastUpdated")}</TableHead>
                  <TableHead className="text-right">{t("inventory.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const status = getStatus(item.quantity, item.minThreshold)
                  const productName = getProductName(item.product)
                  const categoryKey = item.product.category.toLowerCase() as "fruits" | "vegetables" | "grains" | "herbs" | "dairy" | "other"
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{productName}</TableCell>
                      <TableCell>{t(`categories.${categoryKey}`)}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.product.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.reservedQty} {item.product.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity - item.reservedQty} {item.product.unit}
                      </TableCell>
                      <TableCell className="text-right">{currencyFormatter.format(item.product.price)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            status === "in-stock"
                              ? "bg-green-500"
                              : status === "low-stock"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }
                        >
                          {getStatusLabel(status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleDateString(locale)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <EditDialog item={item} onSave={handleUpdateInventory} />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteInventory(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
