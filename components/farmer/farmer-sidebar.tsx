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
import { LanguageSwitcher } from "@/components/language-switcher"
import { UserNav } from "@/components/user-nav"
import { useTranslations } from "@/hooks/useTranslations"
import { cn } from "@/lib/utils"

export function FarmerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { dir, t } = useTranslations()

  const isActive = (path: string) => pathname === path
  const isRTL = dir === "rtl"

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <Sidebar side={isRTL ? "right" : "left"} className={cn(isRTL ? "border-l" : "border-r")}>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" style={{color: 'hsl(var(--primary))'}} />
            <h1 className="text-base sm:text-lg font-bold truncate">AgriSmart</h1>
          </div>
          <SidebarTrigger className="flex-shrink-0 md:hidden" />
        </div>
        <div className="px-3 sm:px-4 py-2">
          <div className="text-xs sm:text-sm text-muted-foreground">{t("farmer.portal")}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("farmer.dashboardLabel")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/farmer/dashboard")}>
                  <Link href="/farmer/dashboard">
                    <BarChart3 />
                    <span>{t("farmer.overview")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("farmer.aiModules")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/farmer/disease-detection")}>
                  <Link href="/farmer/disease-detection">
                    <Microscope />
                    <span>{t("farmer.diseaseDetection")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/farmer/fruit-sizing")}>
                  <Link href="/farmer/fruit-sizing">
                    <Ruler />
                    <span>{t("farmer.fruitSizing")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/farmer/crop-recommendation")}>
                  <Link href="/farmer/crop-recommendation">
                    <CloudRain />
                    <span>{t("farmer.cropRecommendation")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("farmer.management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/farmer/inventory")}>
                  <Link href="/farmer/inventory">
                    <Package />
                    <span>{t("inventory.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/farmer/orders")}>
                  <Link href="/farmer/orders">
                    <ShoppingCart />
                    <span>{t("farmer.orders")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/farmer/chatbot")}>
                  <Link href="/farmer/chatbot">
                    <MessageSquare />
                    <span>{t("farmer.chatbot")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <div className="flex flex-col gap-2">
          <div className="min-w-0 flex-1">
            <UserNav />
          </div>
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <LanguageSwitcher />
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <ModeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout" className="h-8 w-8 p-0">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
