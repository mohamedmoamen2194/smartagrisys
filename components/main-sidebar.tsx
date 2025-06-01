"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  ShoppingCart,
  Leaf,
  MessageSquare,
  Package,
  Microscope,
  Ruler,
  CloudRain,
  Store,
  CreditCard,
  Truck,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"

export function MainSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userType, setUserType] = useState<"farmer" | "customer">("farmer")

  const isActive = (path: string) => pathname === path

  const switchToFarmer = () => {
    setUserType("farmer")
    router.push("/farmer/dashboard")
  }

  const switchToCustomer = () => {
    setUserType("customer")
    router.push("/customer/shop")
  }

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <h1 className="text-lg font-bold">FarmTech Pro</h1>
          </div>
          <SidebarTrigger />
        </div>
        <div className="flex gap-2 p-2">
          <Button
            variant={userType === "farmer" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={switchToFarmer}
          >
            Farmer
          </Button>
          <Button
            variant={userType === "customer" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={switchToCustomer}
          >
            Customer
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {userType === "farmer" ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/farmer/dashboard")}>
                      <Link href="/farmer/dashboard">
                        <BarChart3 />
                        <span>Overview</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>AI Modules</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/farmer/disease-detection")}>
                      <Link href="/farmer/disease-detection">
                        <Microscope />
                        <span>Disease Detection</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/farmer/fruit-sizing")}>
                      <Link href="/farmer/fruit-sizing">
                        <Ruler />
                        <span>Fruit Sizing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/farmer/crop-recommendation")}>
                      <Link href="/farmer/crop-recommendation">
                        <CloudRain />
                        <span>Crop Recommendation</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/farmer/inventory")}>
                      <Link href="/farmer/inventory">
                        <Package />
                        <span>Inventory</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/farmer/orders")}>
                      <Link href="/farmer/orders">
                        <ShoppingCart />
                        <span>Orders</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/farmer/chatbot")}>
                      <Link href="/farmer/chatbot">
                        <MessageSquare />
                        <span>Chatbot</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Shop</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/customer/shop")}>
                      <Link href="/customer/shop">
                        <Store />
                        <span>Browse Products</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/customer/cart")}>
                      <Link href="/customer/cart">
                        <ShoppingCart />
                        <span>Shopping Cart</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/customer/orders")}>
                      <Link href="/customer/orders">
                        <Package />
                        <span>Order History</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/customer/payment-methods")}>
                      <Link href="/customer/payment-methods">
                        <CreditCard />
                        <span>Payment Methods</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/customer/shipping")}>
                      <Link href="/customer/shipping">
                        <Truck />
                        <span>Shipping Info</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <div className="flex items-center justify-between">
          <UserNav />
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
