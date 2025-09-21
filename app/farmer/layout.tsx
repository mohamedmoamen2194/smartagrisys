import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { FarmerSidebar } from "@/components/farmer/farmer-sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="farmer">
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <FarmerSidebar />
          <main className="flex-1 overflow-y-auto">
            {/* Mobile Header with Menu Trigger */}
            <div className="md:hidden sticky top-0 z-40 bg-background border-b px-4 py-3 flex items-center gap-3">
              <SidebarTrigger />
              <h2 className="font-semibold text-lg">AgriSmart</h2>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8 pb-10 min-h-full">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
