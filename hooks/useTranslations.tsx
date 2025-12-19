"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { Locale } from "@/lib/i18n"
// @ts-ignore - JSON imports are supported via resolveJsonModule
import enMessages from "@/messages/en.json"
// @ts-ignore - JSON imports are supported via resolveJsonModule
import arMessages from "@/messages/ar.json"

type Messages = typeof enMessages

const messages: Record<Locale, Messages> = {
  en: enMessages,
  ar: arMessages,
}

interface TranslationContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  dir: "ltr" | "rtl"
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    // Load locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem("locale") as Locale
    if (savedLocale && (savedLocale === "en" || savedLocale === "ar")) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
    // Update HTML lang and dir attributes
    document.documentElement.lang = newLocale
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr"
  }

  useEffect(() => {
    // Update HTML attributes when locale changes
    document.documentElement.lang = locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
  }, [locale])

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = messages[locale]
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found
        value = messages.en
        for (const k2 of keys) {
          if (value && typeof value === "object" && k2 in value) {
            value = value[k2]
          } else {
            return key
          }
        }
        return typeof value === "string" ? value : key
      }
    }
    
    return typeof value === "string" ? value : key
  }

  return (
    <TranslationContext.Provider
      value={{
        locale,
        setLocale,
        t,
        dir: locale === "ar" ? "rtl" : "ltr",
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslations() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslations must be used within TranslationProvider")
  }
  return context
}

