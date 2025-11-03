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

export const DEFAULT_COLORS = [
  '#a8c69f',
  '#94b88b',
  '#7fa977',
  '#6b9a63',
  '#578b4f',
]

export function getColor(index: number) {
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length]
}


