"use client"

import { useState } from "react"
import { useInventory } from "@/hooks/useInventory"
import { useReports } from "@/hooks/useReports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Search, Edit, Trash2, Download } from "lucide-react"
import { InventoryItemModal } from "@/components/inventory/inventory-item-modal"

export default function InventoryPage() {
  const { inventory, loading, addItem, updateItem, deleteItem, getStats } = useInventory()
  const { downloadReport } = useReports()
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const stats = getStats()

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddItem = () => {
    setModalMode("add")
    setSelectedItem(null)
    setModalOpen(true)
  }

  const handleEditItem = (item: any) => {
    setModalMode("edit")
    setSelectedItem(item)
    setModalOpen(true)
  }

  const handleDeleteItem = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(id)
    }
  }

  const handleDownloadReport = () => {
    downloadReport("inventory", inventory)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">kg total inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground">products available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">needs restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "in-stock"
                            ? "default"
                            : item.status === "low-stock"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {item.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditItem(item)} disabled={loading}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={loading}
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

      <InventoryItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addItem}
        onUpdate={updateItem}
        item={selectedItem}
        mode={modalMode}
      />
    </div>
  )
}
