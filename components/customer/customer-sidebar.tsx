"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, Leaf, Store, CreditCard, Truck, Package, LogOut } from "lucide-react"
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

export function CustomerSidebar() {
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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6" style={{color: 'hsl(var(--primary))'}} />
            <h1 className="text-lg font-bold">AgriSmart</h1>
          </div>
          <SidebarTrigger />
        </div>
        <div className="px-4 py-2">
          <div className="text-sm text-muted-foreground">{t("customer.portal")}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("customer.shop")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/customer/shop")}>
                  <Link href="/customer/shop">
                    <Store />
                    <span>{t("customer.browseProducts")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/customer/cart")}>
                  <Link href="/customer/cart">
                    <ShoppingCart />
                    <span>{t("customer.shoppingCart")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("customer.account")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/customer/orders")}>
                  <Link href="/customer/orders">
                    <Package />
                    <span>{t("customer.orderHistory")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/customer/payment-methods")}>
                  <Link href="/customer/payment-methods">
                    <CreditCard />
                    <span>{t("customer.paymentMethods")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/customer/shipping")}>
                  <Link href="/customer/shipping">
                    <Truck />
                    <span>{t("customer.shippingInfo")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <div className="flex flex-col gap-2">
          <UserNav />
          <div className="flex items-center justify-between gap-2">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
