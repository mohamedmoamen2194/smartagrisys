import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, Edit, Trash2 } from "lucide-react"

const paymentMethods = [
  {
    id: 1,
    type: "credit",
    brand: "Visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true,
  },
  {
    id: 2,
    type: "credit",
    brand: "Mastercard",
    last4: "8888",
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
  },
]

export default function PaymentMethodsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">
                      {method.brand} •••• {method.last4}
                    </CardTitle>
                    <CardDescription>
                      Expires {method.expiryMonth.toString().padStart(2, "0")}/{method.expiryYear}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && <Badge>Default</Badge>}
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Add a new payment method</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add a credit or debit card to make purchases easier
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
