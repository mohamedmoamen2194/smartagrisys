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
  SidebarRail,
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
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
            <h1 className="text-base sm:text-lg font-bold truncate">AgriSmart</h1>
          </div>
          <SidebarTrigger className="flex-shrink-0 md:hidden" />
        </div>
        <div className="px-3 sm:px-4 py-2">
          <div className="text-xs sm:text-sm text-muted-foreground">Farmer Portal</div>
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
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <UserNav />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <ModeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout" className="h-8 w-8 p-0">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
