"use client"

import { ReactNode } from "react"

type PageHeaderProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function FarmerPageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm sm:text-base text-muted-foreground mt-1">{subtitle}</p>
      )}
      {actions && (
        <div className="mt-3 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}


