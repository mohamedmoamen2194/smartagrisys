"use client"

import { useTranslations } from "@/hooks/useTranslations"
import { Locale, localeNames } from "@/lib/i18n"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslations()

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{localeNames.en}</SelectItem>
          <SelectItem value="ar">{localeNames.ar}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

