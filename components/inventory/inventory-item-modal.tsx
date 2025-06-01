"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  status: "in-stock" | "low-stock" | "out-of-stock"
  lastUpdated: string
}

interface InventoryItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Omit<InventoryItem, "id" | "status" | "lastUpdated">) => void
  onUpdate: (id: number, updates: Partial<InventoryItem>) => void
  item?: InventoryItem | null
  mode: "add" | "edit"
}

export function InventoryItemModal({ isOpen, onClose, onSave, onUpdate, item, mode }: InventoryItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    price: 0,
  })

  useEffect(() => {
    if (mode === "edit" && item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
      })
    } else {
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        price: 0,
      })
    }
  }, [mode, item, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "add") {
      onSave(formData)
    } else if (mode === "edit" && item) {
      onUpdate(item.id, formData)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Item" : "Edit Item"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Add a new product to your inventory." : "Update the product information."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Herbs">Herbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="pieces">pieces</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="bunches">bunches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Unit ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === "add" ? "Add Item" : "Update Item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
