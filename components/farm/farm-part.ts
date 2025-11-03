export interface FarmPartModel {
  id: string
  name: string
  startRow: number
  startCol: number
  rows: number
  cols: number
  color: string
  character?: string
  cropName?: string
  cropColor?: string
}

import { getPalette, isDarkMode } from "@/components/farm/palette"

export function getColor(index: number) {
  const palette = getPalette(isDarkMode())
  return palette[index % palette.length]
}


