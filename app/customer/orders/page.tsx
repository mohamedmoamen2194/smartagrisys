import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, CheckCircle, Clock } from "lucide-react"

const customerOrders = [
  {
    id: "ORD-001",
    date: "2025-06-01",
    status: "delivered",
    total: 75.0,
    items: [{ name: "Fresh Apples", quantity: 25, price: 3.0 }],
    farmer: "John's Farm",
    deliveryDate: "2025-06-03",
  },
  {
    id: "ORD-002",
    date: "2025-05-28",
    status: "shipped",
    total: 124.5,
    items: [{ name: "Sweet Corn", quantity: 50, price: 2.49 }],
    farmer: "Green Valley Farm",
    deliveryDate: "2025-06-02",
  },
  {
    id: "ORD-003",
    date: "2025-05-25",
    status: "processing",
    total: 64.35,
    items: [{ name: "Organic Tomatoes", quantity: 15, price: 4.29 }],
    farmer: "Sunny Acres",
    deliveryDate: "2025-06-05",
  },
]

export default function CustomerOrdersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <Button variant="outline">Download Receipt</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Being delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,247</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mt-6">
        {customerOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order {order.id}</CardTitle>
                  <CardDescription>Placed on {order.date}</CardDescription>
                </div>
                <Badge
                  variant={
                    order.status === "delivered" ? "default" : order.status === "shipped" ? "secondary" : "outline"
                  }
                >
                  {order.status === "delivered" && <CheckCircle className="mr-1 h-3 w-3" />}
                  {order.status === "shipped" && <Truck className="mr-1 h-3 w-3" />}
                  {order.status === "processing" && <Clock className="mr-1 h-3 w-3" />}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">From {order.farmer}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.status === "delivered" ? "Delivered" : "Expected delivery"}: {order.deliveryDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Total: ${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
