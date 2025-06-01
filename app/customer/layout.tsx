import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CustomerSidebar } from "@/components/customer/customer-sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requiredRole="customer">
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <CustomerSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="pb-10">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
