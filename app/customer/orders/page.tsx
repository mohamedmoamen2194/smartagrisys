"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Truck, CheckCircle, Clock, AlertCircle, MapPin, CreditCard, Calendar } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"

type OrderItem = {
  id: string
  quantity: number
  unitPrice: number
  total: number
  product: {
    id: string
    name: string
    price: number
  }
}

type Order = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: any
  paymentMethod: string
  createdAt: string
  farmer: {
    id: string
    farmName: string
  }
  orderItems: OrderItem[]
}

type DashboardStats = {
  totalOrders: number
  inTransitOrders: number
  deliveredOrders: number
  totalSpent: number
}

export default function CustomerOrdersPage() {
  const { t } = useTranslations()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          setError('User not authenticated');
          return;
        }

        const response = await fetch('/api/orders', {
          headers: {
            'authorization': user
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);

        // Calculate stats
        const totalOrders = data.length;
        const inTransitOrders = data.filter((order: Order) => 
          order.status === 'SHIPPED' || order.status === 'PROCESSING'
        ).length;
        const deliveredOrders = data.filter((order: Order) => 
          order.status === 'DELIVERED'
        ).length;
        const totalSpent = data.filter((order: Order) => order.status !== "CANCELLED").reduce((sum: number, order: Order) => sum + Number(order.total), 0);

        setStats({
          totalOrders,
          inTransitOrders,
          deliveredOrders,
          totalSpent
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="mr-1 h-3 w-3" />
      case 'SHIPPED':
      case 'PROCESSING':
        return <Truck className="mr-1 h-3 w-3" />
      case 'PENDING':
        return <Clock className="mr-1 h-3 w-3" />
      default:
        return <Package className="mr-1 h-3 w-3" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'default'
      case 'SHIPPED':
      case 'PROCESSING':
        return 'secondary'
      case 'PENDING':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }

  const handleReorder = (order: Order) => {
    // Add items to cart
    order.orderItems.forEach(item => {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = existingCart.find((cartItem: any) => cartItem.productId === item.product.id);
      
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        existingCart.push({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          farmerId: order.farmer.id
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(existingCart));
    });
    
    // Navigate to cart
    window.location.href = '/customer/cart';
  }

  if (loading) {
    return <div className="container mx-auto py-6">{t("customerOrders.loadingOrders")}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("customerOrders.title")}</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>{t("customerOrders.refresh")}</Button>
      </div>

      {error && (
        <Alert className="mt-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("customerOrders.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("customerOrders.totalOrders")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">{t("customerOrders.allTime")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("customerOrders.inTransit")}</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransitOrders}</div>
            <p className="text-xs text-muted-foreground">{t("customerOrders.beingDelivered")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("customerOrders.delivered")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">{t("customerOrders.successfullyDelivered")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("customerOrders.totalSpent")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("customerOrders.allTime")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mt-6">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("customerOrders.noOrders")}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t("customerOrders.startShopping")}
              </p>
              <Button asChild>
                <a href="/customer/shop">{t("customerOrders.browseProducts")}</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <CardDescription>{t("customerOrders.placedOn")} {formatDate(order.createdAt)}</CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{t("customerOrders.quantity")}: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${Number(item.total).toFixed(2)}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("customerOrders.from")} {order.farmer.farmName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("customerOrders.payment")}: {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{t("customerOrders.total")}: ${Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      {t("customerOrders.viewDetails")}
                    </Button>
                    {order.status === "DELIVERED" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReorder(order)}
                      >
                        {t("customerOrders.reorder")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("customerOrders.orderDetails")} - {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{t("customerOrders.orderStatus")}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).toLowerCase()}
                  </p>
                </div>
                <Badge variant={getStatusVariant(selectedOrder.status)}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).toLowerCase()}
                </Badge>
              </div>

              {/* Order Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {t("customerOrders.orderDate")}
                  </div>
                  <p className="font-medium">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    {t("customerOrders.paymentMethod")}
                  </div>
                  <p className="font-medium">{selectedOrder.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              {/* Farmer Information */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">{t("customerShop.farmer")}</h3>
                <p className="text-sm">{selectedOrder.farmer.farmName}</p>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t("customerOrders.shippingAddress")}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-3">{t("customerOrders.orderItems")}</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("customerOrders.quantity")}: {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${Number(item.total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("customerOrders.subtotal")}:</span>
                    <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("customerOrders.shipping")}:</span>
                    <span>${Number(selectedOrder.shippingCost).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>{t("customerOrders.total")}:</span>
                    <span>${Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1"
                >
                  {t("common.close")}
                </Button>
                {selectedOrder.status === "DELIVERED" && (
                  <Button 
                    onClick={() => {
                      handleReorder(selectedOrder);
                      setShowOrderModal(false);
                    }}
                    className="flex-1"
                  >
                    {t("customerOrders.reorder")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
