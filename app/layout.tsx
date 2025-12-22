import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { MainNav } from "@/components/main-nav"
import { TranslationProvider } from "@/hooks/useTranslations"
import { HtmlLangDir } from "@/components/html-lang-dir"

const poppins = Poppins({ subsets: ["latin"], weight: ['400'] })

export const metadata: Metadata = {
  title: "Smart Agriculture System",
  description: "AI-powered assistant for farmers and customers",
  generator: 'v0.dev',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/img.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${poppins.className} antialiased`}>
        <TranslationProvider>
          <HtmlLangDir />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <MainNav />
            {children}
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  fontSize: '14px',
                },
                className: 'text-sm',
              }}
            />
          </ThemeProvider>
        </TranslationProvider>
      </body>
    </html>
  )
}
