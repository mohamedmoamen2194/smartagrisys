"use client"

import { useState } from "react"

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

const initialInventory: InventoryItem[] = [
  {
    id: 1,
    name: "Apples",
    category: "Fruits",
    quantity: 150,
    unit: "kg",
    price: 3.99,
    status: "in-stock",
    lastUpdated: "2025-06-01",
  },
  {
    id: 2,
    name: "Tomatoes",
    category: "Vegetables",
    quantity: 8,
    unit: "kg",
    price: 4.29,
    status: "low-stock",
    lastUpdated: "2025-05-31",
  },
  {
    id: 3,
    name: "Corn",
    category: "Vegetables",
    quantity: 200,
    unit: "pieces",
    price: 2.49,
    status: "in-stock",
    lastUpdated: "2025-06-01",
  },
  {
    id: 4,
    name: "Carrots",
    category: "Vegetables",
    quantity: 0,
    unit: "kg",
    price: 2.99,
    status: "out-of-stock",
    lastUpdated: "2025-05-30",
  },
  {
    id: 5,
    name: "Bell Peppers",
    category: "Vegetables",
    quantity: 45,
    unit: "kg",
    price: 5.49,
    status: "in-stock",
    lastUpdated: "2025-06-01",
  },
]

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [loading, setLoading] = useState(false)

  const getStatus = (quantity: number): "in-stock" | "low-stock" | "out-of-stock" => {
    if (quantity === 0) return "out-of-stock"
    if (quantity <= 10) return "low-stock"
    return "in-stock"
  }

  const addItem = async (item: Omit<InventoryItem, "id" | "status" | "lastUpdated">) => {
    setLoading(true)
    try {
      const newItem: InventoryItem = {
        ...item,
        id: Math.max(...inventory.map((i) => i.id)) + 1,
        status: getStatus(item.quantity),
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      setInventory((prev) => [...prev, newItem])
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (id: number, updates: Partial<InventoryItem>) => {
    setLoading(true)
    try {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const updated = { ...item, ...updates, lastUpdated: new Date().toISOString().split("T")[0] }
            if (updates.quantity !== undefined) {
              updated.status = getStatus(updates.quantity)
            }
            return updated
          }
          return item
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id: number) => {
    setLoading(true)
    try {
      setInventory((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setLoading(false)
    }
  }

  const getStats = () => {
    const totalProducts = inventory.reduce((sum, item) => sum + item.quantity, 0)
    const inStock = inventory.filter((item) => item.status === "in-stock").length
    const lowStock = inventory.filter((item) => item.status === "low-stock").length
    const outOfStock = inventory.filter((item) => item.status === "out-of-stock").length

    return { totalProducts, inStock, lowStock, outOfStock }
  }

  return {
    inventory,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getStats,
  }
}
