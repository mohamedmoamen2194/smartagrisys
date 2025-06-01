import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Edit, Trash2 } from "lucide-react"

const addresses = [
  {
    id: 1,
    name: "Home",
    fullName: "John Doe",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    isDefault: true,
  },
  {
    id: 2,
    name: "Office",
    fullName: "John Doe",
    address: "456 Business Ave",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    country: "United States",
    isDefault: false,
  },
]

export default function ShippingPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shipping Addresses</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {address.name}
                      {address.isDefault && <Badge>Default</Badge>}
                    </CardTitle>
                    <CardDescription>{address.fullName}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>{address.address}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Add a new address</h3>
            <p className="text-muted-foreground text-center mb-4">Add a shipping address for faster checkout</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add New Address</CardTitle>
          <CardDescription>Enter your shipping address details</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="NY" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input id="zipCode" placeholder="10001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="United States" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Save Address
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
