import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const orders = [
  {
    id: "ORD-001",
    customer: "John Smith",
    product: "Apples (Grade A)",
    quantity: 25,
    total: "$75.00",
    status: "pending",
    date: "2025-06-01",
  },
  {
    id: "ORD-002",
    customer: "Sarah Johnson",
    product: "Corn (Organic)",
    quantity: 50,
    total: "$124.50",
    status: "processing",
    date: "2025-06-01",
  },
  {
    id: "ORD-003",
    customer: "Michael Brown",
    product: "Tomatoes (Grade A)",
    quantity: 15,
    total: "$64.35",
    status: "shipped",
    date: "2025-05-31",
  },
  {
    id: "ORD-004",
    customer: "Emily Davis",
    product: "Mixed Vegetables",
    quantity: 30,
    total: "$89.70",
    status: "delivered",
    date: "2025-05-30",
  },
  {
    id: "ORD-005",
    customer: "Robert Wilson",
    product: "Apples (Grade B)",
    quantity: 40,
    total: "$99.60",
    status: "pending",
    date: "2025-05-30",
  },
]

export function RecentOrders() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.product}</TableCell>
              <TableCell className="text-right">{order.quantity}</TableCell>
              <TableCell className="text-right">{order.total}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === "pending"
                      ? "outline"
                      : order.status === "processing"
                        ? "secondary"
                        : order.status === "shipped"
                          ? "default"
                          : "success"
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
