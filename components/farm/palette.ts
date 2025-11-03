export const GREEN_PALETTE_LIGHT_TO_DARK = [
  '#c6dba1', // very light green
  '#a9cb83', // light green
  '#86b26e', // mid-light green
  '#6f985a', // medium green
  '#5a7f49', // mid-dark green
  '#3f5f3b', // dark green
]

export function getPalette(isDark: boolean): string[] {
  return isDark ? [...GREEN_PALETTE_LIGHT_TO_DARK].reverse() : GREEN_PALETTE_LIGHT_TO_DARK
}

export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}


