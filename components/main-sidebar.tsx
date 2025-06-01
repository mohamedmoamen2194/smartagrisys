"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  const [userType, setUserType] = useState<"farmer" | "customer">("farmer")

  const isActive = (path: string) => pathname === path

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <h1 className="text-lg font-bold">AgriSmart</h1>
          </div>
          <SidebarTrigger />
        </div>
        <div className="flex gap-2 p-2">
          <Button
            variant={userType === "farmer" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setUserType("farmer")}
          >
            Farmer
          </Button>
          <Button
            variant={userType === "customer" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setUserType("customer")}
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
                    <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                      <Link href="/dashboard">
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
                    <SidebarMenuButton asChild isActive={isActive("/disease-detection")}>
                      <Link href="/disease-detection">
                        <Microscope />
                        <span>Disease Detection</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/fruit-sizing")}>
                      <Link href="/fruit-sizing">
                        <Ruler />
                        <span>Fruit Sizing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/crop-recommendation")}>
                      <Link href="/crop-recommendation">
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
                    <SidebarMenuButton asChild isActive={isActive("/inventory")}>
                      <Link href="/inventory">
                        <Package />
                        <span>Inventory</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/orders")}>
                      <Link href="/orders">
                        <ShoppingCart />
                        <span>Orders</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/chatbot")}>
                      <Link href="/chatbot">
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
                    <SidebarMenuButton asChild isActive={isActive("/shop")}>
                      <Link href="/shop">
                        <Store />
                        <span>Browse Products</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/cart")}>
                      <Link href="/cart">
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
                    <SidebarMenuButton asChild isActive={isActive("/orders-history")}>
                      <Link href="/orders-history">
                        <Package />
                        <span>Order History</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/payment-methods")}>
                      <Link href="/payment-methods">
                        <CreditCard />
                        <span>Payment Methods</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/shipping-info")}>
                      <Link href="/shipping-info">
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
