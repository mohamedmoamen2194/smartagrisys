"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Search, Eye, Package, Truck, XCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const user = localStorage.getItem("user")
        if (!user) return
        const res = await fetch("/api/farmer/orders", {
          headers: { authorization: user }
        })
        const data = await res.json()
        console.log('Farmer orders API response:', data)
        if (Array.isArray(data)) {
          setOrders(data)
        } else {
          setOrders([])
          toast.error(data.error || "Failed to fetch orders")
        }
      } catch (e) {
        setOrders([])
        toast.error("Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    if (tab === "all") return true
    return order.status === tab.toUpperCase()
  })

  const handleView = (order) => setSelectedOrder(order)
  const handleClose = () => setSelectedOrder(null)

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    setStatusUpdating(true)
    try {
      const user = localStorage.getItem("user")
      const res = await fetch("/api/farmer/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", authorization: user },
        body: JSON.stringify({ orderId: selectedOrder.id, status: newStatus })
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setOrders(orders => orders.map(o => o.id === updated.order.id ? updated.order : o))
      setSelectedOrder(updated.order)
      toast.success("Order status updated")
    } catch {
      toast.error("Failed to update status")
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleReject = async (order) => {
    if (!confirm(`Are you sure you want to cancel order ${order.orderNumber}? This action cannot be undone.`)) {
      return
    }

    setStatusUpdating(true)
    try {
      const user = localStorage.getItem("user")
      const res = await fetch("/api/farmer/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", authorization: user },
        body: JSON.stringify({ orderId: order.id, status: "CANCELLED" })
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setOrders(orders => orders.map(o => o.id === updated.order.id ? updated.order : o))
      toast.success("Order cancelled successfully")
    } catch {
      toast.error("Failed to cancel order")
    } finally {
      setStatusUpdating(false)
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "PENDING":
        return "outline"
      case "PROCESSING":
        return "secondary"
      case "SHIPPED":
        return "default"
      case "DELIVERED":
        return "default"
      case "CANCELLED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "CANCELLED":
        return <XCircle className="mr-1 h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <Button variant="outline">Export Orders</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === "PENDING").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === "SHIPPED").length}</div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${orders.filter(o => o.status === "DELIVERED").reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search orders..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product(s)</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8}>Loading...</TableCell></TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow><TableCell colSpan={8}>No orders found.</TableCell></TableRow>
                    ) : filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customer?.user?.firstName} {order.customer?.user?.lastName}</TableCell>
                        <TableCell>
                          {order.orderItems.map((item) => item.product?.name).join(", ")}
                        </TableCell>
                        <TableCell className="text-right">
                          {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                        </TableCell>
                        <TableCell className="text-right">${Number(order.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(order.status)}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleView(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            {order.status === "PENDING" && (
                                                           <Button 
                               variant="destructive" 
                               size="sm" 
                               onClick={() => handleReject(order)}
                               disabled={statusUpdating}
                             >
                               <XCircle className="mr-2 h-4 w-4" />
                               Cancel
                             </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <strong>Order ID:</strong> {selectedOrder.orderNumber}<br />
                <strong>Customer:</strong> {selectedOrder.customer?.user?.firstName} {selectedOrder.customer?.user?.lastName}<br />
                <strong>Status:</strong> {selectedOrder.status}
              </div>
              <div>
                <strong>Products:</strong>
                <ul className="list-disc ml-6">
                  {selectedOrder.orderItems.map(item => (
                    <li key={item.id}>{item.product?.name} x {item.quantity}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Total:</strong> ${Number(selectedOrder.total).toFixed(2)}
              </div>
              <div>
                <label className="block font-medium mb-1">Change Status:</label>
                <select
                  className="border rounded px-2 py-1"
                  value={selectedOrder.status}
                  onChange={handleStatusChange}
                  disabled={statusUpdating}
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              {selectedOrder.status === "PENDING" && (
                <div className="pt-2">
                                     <Button 
                     variant="destructive" 
                     onClick={() => handleReject(selectedOrder)}
                     disabled={statusUpdating}
                     className="w-full"
                   >
                     <XCircle className="mr-2 h-4 w-4" />
                     Cancel Order
                   </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
