import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl", 
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full"
}

const paddingClasses = {
  none: "",
  sm: "p-4 sm:p-6",
  md: "p-4 sm:p-6 lg:p-8", 
  lg: "p-6 sm:p-8 lg:p-12"
}

export function ResponsiveContainer({ 
  children, 
  className,
  size = "xl",
  padding = "md"
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "mx-auto w-full",
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}
