"use client"

import { useEffect } from "react"
import { useTranslations } from "@/hooks/useTranslations"

export function HtmlLangDir() {
  const { locale, dir } = useTranslations()

  useEffect(() => {
    // Update HTML lang and dir attributes
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir])

  return null
}

