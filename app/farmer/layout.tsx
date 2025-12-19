"use client"

import type React from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { FarmerSidebar } from "@/components/farmer/farmer-sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "@/hooks/useTranslations"

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { dir } = useTranslations()
  const isRTL = dir === "rtl"
  
  return (
    <AuthGuard requiredRole="farmer">
      <SidebarProvider className={isRTL ? "flex-row-reverse" : ""}>
        {isRTL ? (
          <>
            <SidebarInset dir={dir}>
              {/* Mobile Header with Menu Trigger */}
              <div className="md:hidden sticky top-0 z-40 bg-background border-b px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <h2 className="font-semibold text-lg">AgriSmart</h2>
                </div>
                <LanguageSwitcher />
              </div>
              <div className="p-4 sm:p-6 lg:px-8 pb-10 min-h-full">
                {children}
              </div>
            </SidebarInset>
            <FarmerSidebar />
          </>
        ) : (
          <>
            <FarmerSidebar />
            <SidebarInset dir={dir}>
              {/* Mobile Header with Menu Trigger */}
              <div className="md:hidden sticky top-0 z-40 bg-background border-b px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <h2 className="font-semibold text-lg">AgriSmart</h2>
                </div>
                <LanguageSwitcher />
              </div>
              <div className="p-4 sm:p-6 lg:px-8 pb-10 min-h-full">
                {children}
              </div>
            </SidebarInset>
          </>
        )}
      </SidebarProvider>
    </AuthGuard>
  )
}
