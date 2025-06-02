"use client"

import { useEffect, useState } from "react"
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

interface Product {
  id: string
  name: string
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

function AddDialog({ onAdd }: AddDialogProps) {
  // Product fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState(0)
  const [unit, setUnit] = useState("")
  
  // Inventory fields
  const [quantity, setQuantity] = useState(0)
  const [minThreshold, setMinThreshold] = useState(10)
  const [maxThreshold, setMaxThreshold] = useState(1000)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!name || !category || !price || !unit) {
      toast.error("Please fill in all required product fields")
      return
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    try {
      setLoading(true)
      
      // First create the product
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        throw new Error("Please log in again")
      }

      const productResponse = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userStr,
        },
        body: JSON.stringify({
          name,
          description,
          category,
          price,
          unit
        }),
      })

      if (!productResponse.ok) {
        throw new Error('Failed to create product')
      }

      const product = await productResponse.json()

      // Then add it to inventory
      await onAdd({
        productId: product.id,
        quantity,
        minThreshold,
        maxThreshold
      })

      setIsOpen(false)
      toast.success("Product added to inventory successfully")
    } catch (error) {
      toast.error("Failed to add product to inventory")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product to Inventory</DialogTitle>
          <DialogDescription>Create a new product and add it to your inventory</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Product Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FRUITS">Fruits</SelectItem>
                <SelectItem value="VEGETABLES">Vegetables</SelectItem>
                <SelectItem value="GRAINS">Grains</SelectItem>
                <SelectItem value="HERBS">Herbs</SelectItem>
                <SelectItem value="DAIRY">Dairy</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="kg, pieces, etc."
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Initial Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minThreshold" className="text-right">
              Min Threshold
            </Label>
            <Input
              id="minThreshold"
              type="number"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxThreshold" className="text-right">
              Max Threshold
            </Label>
            <Input
              id="maxThreshold"
              type="number"
              value={maxThreshold}
              onChange={(e) => setMaxThreshold(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add to Inventory"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({ item, onSave }: EditDialogProps) {
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
      toast.success("Inventory updated successfully")
    } catch (error) {
      toast.error("Failed to update inventory")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Inventory</DialogTitle>
          <DialogDescription>Update inventory details for {item.product.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minThreshold" className="text-right">
              Min Threshold
            </Label>
            <Input
              id="minThreshold"
              type="number"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxThreshold" className="text-right">
              Max Threshold
            </Label>
            <Input
              id="maxThreshold"
              type="number"
              value={maxThreshold}
              onChange={(e) => setMaxThreshold(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        setError("Please log in again")
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
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory')
      toast.error("Failed to fetch inventory")
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
    if (!confirm('Are you sure you want to delete this inventory item?')) {
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
      toast.success("Inventory item deleted successfully")
    } catch (error) {
      console.error('Error deleting inventory:', error)
      toast.error("Failed to delete inventory item")
    }
  }

  const getStatus = (quantity: number, minThreshold: number) => {
    if (quantity <= 0) return "out-of-stock"
    if (quantity <= minThreshold) return "low-stock"
    return "in-stock"
  }

  const filteredItems = searchQuery
    ? inventoryItems.filter(item =>
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : inventoryItems

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading inventory...</div>
  }

  if (error) {
    return <div className="container mx-auto py-6 text-red-500">Error: {error}</div>
  }

  const totalQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockCount = inventoryItems.filter(item => item.quantity > 0 && item.quantity <= item.minThreshold).length
  const outOfStockCount = inventoryItems.filter(item => item.quantity <= 0).length
  const inStockCount = inventoryItems.filter(item => item.quantity > item.minThreshold).length

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <AddDialog onAdd={handleAddInventory} />
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">total inventory items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inStockCount}</div>
            <p className="text-xs text-muted-foreground">products available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">needs restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage your product inventory and stock levels</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell>{item.product.category}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.product.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.reservedQty} {item.product.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity - item.reservedQty} {item.product.unit}
                    </TableCell>
                    <TableCell className="text-right">${item.product.price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatus(item.quantity, item.minThreshold) === "in-stock"
                            ? "default"
                            : getStatus(item.quantity, item.minThreshold) === "low-stock"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {getStatus(item.quantity, item.minThreshold).replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
