"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MapPin, Plus, Edit, Trash2, Check } from "lucide-react"
import { toast } from "sonner"

interface Address {
  id: string
  name: string
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

interface AddressForm {
  name: string
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export default function ShippingPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState<AddressForm>({
    name: '',
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isDefault: false
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        toast.error('User not authenticated')
        return
      }

      const response = await fetch('/api/customer/addresses', {
        headers: {
          'authorization': user
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }

      const data = await response.json()
      setAddresses(data)
    } catch (error) {
      console.error('Error fetching addresses:', error)
      toast.error('Failed to fetch addresses')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddress(addressId)
  }

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address")
      return
    }
    
    const address = addresses.find(addr => addr.id === selectedAddress)
    if (address) {
      localStorage.setItem('selectedShippingAddress', JSON.stringify(address))
      router.push('/customer/payment')
    }
  }

  const handleAddAddress = () => {
    setFormData({
      name: '',
      fullName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      isDefault: addresses.length === 0
    })
    setShowAddModal(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      name: address.name,
      fullName: address.fullName,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    })
    setShowEditModal(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const user = localStorage.getItem('user')
      const response = await fetch(`/api/customer/addresses?id=${addressId}`, {
        method: 'DELETE',
        headers: {
          'authorization': user!
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete address')
      }

      toast.success('Address deleted successfully')
      fetchAddresses()
      
      // If we deleted the selected address, clear selection
      if (selectedAddress === addressId) {
        setSelectedAddress(null)
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const user = localStorage.getItem('user')
      const url = showEditModal ? '/api/customer/addresses' : '/api/customer/addresses'
      const method = showEditModal ? 'PUT' : 'POST'
      const body = showEditModal ? { ...formData, id: editingAddress!.id } : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'authorization': user!
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error('Failed to save address')
      }

      toast.success(showEditModal ? 'Address updated successfully' : 'Address added successfully')
      setShowAddModal(false)
      setShowEditModal(false)
      setEditingAddress(null)
      fetchAddresses()
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    }
  }

  const handleInputChange = (field: keyof AddressForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return <div className="container mx-auto py-6">Loading addresses...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Select Shipping Address</h1>
        <Button onClick={handleAddAddress}>
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      <div className="grid gap-4 mt-6">
        {addresses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No addresses yet</h3>
              <p className="text-muted-foreground text-center mb-4">Add a shipping address to get started</p>
              <Button onClick={handleAddAddress}>
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`cursor-pointer transition-all ${
                selectedAddress === address.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-muted-foreground/50'
              }`}
              onClick={() => handleAddressSelect(address.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {address.name}
                        {address.isDefault && <Badge>Default</Badge>}
                        {selectedAddress === address.id && (
                          <Badge variant="default" className="bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{address.fullName}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditAddress(address)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteAddress(address.id)
                      }}
                    >
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
          ))
        )}
      </div>

      {selectedAddress && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleContinueToPayment} size="lg">
            Continue to Payment
          </Button>
        </div>
      )}

      {/* Add Address Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Address Name</Label>
                <Input 
                  id="name" 
                  placeholder="Home, Office, etc."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  placeholder="NY"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input 
                  id="zipCode" 
                  placeholder="10001"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              />
              <Label htmlFor="isDefault">Set as default address</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Address</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Address Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Address Name</Label>
                <Input 
                  id="edit-name" 
                  placeholder="Home, Office, etc."
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input 
                  id="edit-fullName" 
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input 
                id="edit-address" 
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input 
                  id="edit-city" 
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-state">State</Label>
                <Input 
                  id="edit-state" 
                  placeholder="NY"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-zipCode">ZIP Code</Label>
                <Input 
                  id="edit-zipCode" 
                  placeholder="10001"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input 
                  id="edit-country" 
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              />
              <Label htmlFor="edit-isDefault">Set as default address</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Address</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
