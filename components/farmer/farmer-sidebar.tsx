"use client"

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
  LogOut,
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

export function FarmerSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
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
        <div className="px-4 py-2">
          <div className="text-sm text-muted-foreground">Farmer Dashboard</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
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
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <div className="flex items-center justify-between">
          <UserNav />
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
