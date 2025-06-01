import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
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
            <div className="pb-10">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
