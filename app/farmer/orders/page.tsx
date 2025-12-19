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
import { FarmerPageHeader } from "@/components/farmer/page-header"
import { useTranslations } from "@/hooks/useTranslations"

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

export default function OrdersPage() {
  const { t } = useTranslations()
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
      toast.success(t("farmerOrders.orderStatusUpdated"))
    } catch {
      toast.error(t("farmerOrders.failedToUpdateStatus"))
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleReject = async (order) => {
    if (!confirm(t("farmerOrders.confirmCancel").replace("{orderNumber}", order.orderNumber))) {
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
      toast.success(t("farmerOrders.orderCancelled"))
    } catch {
      toast.error(t("farmerOrders.failedToCancel"))
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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <FarmerPageHeader title={t("farmerOrders.title")} actions={<Button variant="outline">{t("farmerOrders.exportOrders")}</Button>} />

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("farmerOrders.totalOrders")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">{t("farmerOrders.thisMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("farmerOrders.pending")}</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === "PENDING").length}</div>
            <p className="text-xs text-muted-foreground">{t("farmerOrders.awaitingProcessing")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("farmerOrders.shipped")}</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === "SHIPPED").length}</div>
            <p className="text-xs text-muted-foreground">{t("farmerOrders.inTransit")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("farmerOrders.revenue")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${orders.filter(o => o.status === "DELIVERED").reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t("farmerOrders.thisMonth")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">{t("farmerOrders.allOrders")}</TabsTrigger>
          <TabsTrigger value="pending">{t("farmerOrders.pending")}</TabsTrigger>
          <TabsTrigger value="processing">{t("farmerOrders.processing")}</TabsTrigger>
          <TabsTrigger value="shipped">{t("farmerOrders.shipped")}</TabsTrigger>
          <TabsTrigger value="delivered">{t("farmerOrders.delivered")}</TabsTrigger>
          <TabsTrigger value="cancelled">{t("farmerOrders.cancelled")}</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("farmerOrders.orders")}</CardTitle>
              <CardDescription>{t("farmerOrders.manageOrders")}</CardDescription>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={t("farmerOrders.searchOrders")} className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("farmerOrders.orderId")}</TableHead>
                      <TableHead>{t("farmerOrders.customer")}</TableHead>
                      <TableHead>{t("farmerOrders.products")}</TableHead>
                      <TableHead className="text-right">{t("farmerOrders.quantity")}</TableHead>
                      <TableHead className="text-right">{t("farmerOrders.total")}</TableHead>
                      <TableHead>{t("farmerOrders.status")}</TableHead>
                      <TableHead>{t("farmerOrders.date")}</TableHead>
                      <TableHead className="text-right">{t("farmerOrders.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8}>{t("farmerOrders.loading")}</TableCell></TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow><TableCell colSpan={8}>{t("farmerOrders.noOrders")}</TableCell></TableRow>
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
                              {t("farmerOrders.view")}
                            </Button>
                            {order.status === "PENDING" && (
                                                           <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleReject(order)}
                              disabled={statusUpdating}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              {t("farmerOrders.cancel")}
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
            <DialogTitle>{t("farmerOrders.orderDetails")}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <strong>{t("farmerOrders.orderId")}:</strong> {selectedOrder.orderNumber}<br />
                <strong>{t("farmerOrders.customer")}:</strong> {selectedOrder.customer?.user?.firstName} {selectedOrder.customer?.user?.lastName}<br />
                <strong>{t("farmerOrders.status")}:</strong> {selectedOrder.status}
              </div>
              <div>
                <strong>{t("farmerOrders.products")}:</strong>
                <ul className="list-disc ml-6">
                  {selectedOrder.orderItems.map(item => (
                    <li key={item.id}>{item.product?.name} x {item.quantity}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>{t("farmerOrders.total")}:</strong> ${Number(selectedOrder.total).toFixed(2)}
              </div>
              <div>
                <label className="block font-medium mb-1">{t("farmerOrders.changeStatus")}:</label>
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
                     {t("farmerOrders.cancelOrder")}
                   </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
