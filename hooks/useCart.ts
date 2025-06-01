"use client"

import { useState, useEffect } from "react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  unit: string
  farmer: string
  image: string
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error loading cart:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = async (product: Omit<CartItem, "quantity">) => {
    setLoading(true)
    try {
      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === product.id)
        if (existingItem) {
          return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        } else {
          return [...prev, { ...product, quantity: 1 }]
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (id: number, quantity: number) => {
    setLoading(true)
    try {
      if (quantity <= 0) {
        setCartItems((prev) => prev.filter((item) => item.id !== id))
      } else {
        setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
      }
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (id: number) => {
    setLoading(true)
    try {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    setLoading(true)
    try {
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  }
}
