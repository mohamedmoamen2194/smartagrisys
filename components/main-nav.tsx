"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Leaf, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

export function MainNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Hide navigation on authenticated pages (farmer/customer routes)
  const isAuthenticatedPage = pathname?.startsWith("/farmer") || pathname?.startsWith("/customer")

  useEffect(() => {
    // Only set up scroll listener if not on authenticated page
    if (isAuthenticatedPage) {
      return
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isAuthenticatedPage])

  // Hide navigation on authenticated pages (farmer/customer routes)
  if (isAuthenticatedPage) {
    return null
  }

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about-us" },
    { label: "Services", href: "/services" },
    { label: "Store", href: "/store" },
    { label: "Weather & Market", href: "/weather-market" },
    { label: "Contact Us", href: "/contact-us" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md border-b"
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14 lg:h-16">
          {/* Logo and Title - Left */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity z-10"
          >
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: "hsl(var(--primary))" }} />
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Agri<span style={{ color: "hsl(var(--primary))" }}>Smart</span>
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors relative group whitespace-nowrap",
                  pathname === item.href
                    ? "text-primary"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary"
                )}
              >
                {item.label}
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )}></span>
              </Link>
            ))}
          </div>

          {/* Right Side - Login and Theme Toggle */}
          <div className="flex items-center gap-2 z-10">
            <ModeToggle />
            <Button asChild variant="outline" size="sm" className="text-xs hidden lg:inline-flex">
              <Link href="/auth/farmer/login">Farmer Login</Link>
            </Button>
            <Button asChild size="sm" className="text-xs hidden lg:inline-flex">
              <Link href="/auth/customer/login">Customer Login</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t mt-2 pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "text-left text-sm font-medium transition-colors py-2",
                    pathname === item.href
                      ? "text-primary"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <ModeToggle />
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/farmer/login">Farmer Login</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth/customer/login">Customer Login</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

