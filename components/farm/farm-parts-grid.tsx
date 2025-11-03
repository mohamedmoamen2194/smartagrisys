"use client"

import { motion } from "motion/react"
import { FarmPartModel } from "@/components/farm/farm-part"

type Props = {
  rows: number
  cols: number
  parts: FarmPartModel[]
  onPartClick?: (part: FarmPartModel) => void
  selectedPartId?: string
}

export function FarmPartsGrid({ rows, cols, parts, onPartClick, selectedPartId }: Props) {
  const grid: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null))
  parts.forEach((p) => {
    for (let r = p.startRow; r < Math.min(p.startRow + p.rows, rows); r++) {
      for (let c = p.startCol; c < Math.min(p.startCol + p.cols, cols); c++) {
        if (r >= 0 && c >= 0 && r < rows && c < cols) grid[r][c] = p.id
      }
    }
  })

  const getPart = (r: number, c: number) => parts.find((p) => p.id === grid[r][c]) || null
  const isStart = (r: number, c: number, p: FarmPartModel) => p.startRow === r && p.startCol === c

  return (
    <div
      className="grid gap-1 p-3 bg-gradient-to-br from-green-200 via-green-300 to-green-200 rounded-xl border-4 border-amber-900 shadow-2xl relative"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0,1fr))` }}
    >
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const part = getPart(r, c)
        const isSelected = part?.id === selectedPartId
        return (
          <motion.div
            key={`${r}-${c}`}
            onClick={() => part && onPartClick?.(part)}
            className={`aspect-square flex items-center justify-center rounded ${part ? "" : "bg-green-100/50"} ${
              isSelected ? "ring-4 ring-yellow-400 ring-inset" : ""
            } cursor-pointer relative transition-all duration-200`}
            style={{ backgroundColor: part ? part.cropColor || part.color : undefined, opacity: part ? 1 : 0.3, transformStyle: "preserve-3d" }}
            whileHover={part ? { scale: 1.05, z: 20, transition: { type: "spring", stiffness: 400, damping: 20 } } : {}}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: part ? 1 : 0.3, scale: 1 }}
            transition={{ delay: (r * cols + c) * 0.005, duration: 0.2 }}
            title={part ? `${part.name}${part.cropName ? ` • ${part.cropName}` : ""}` : undefined}
          >
            {part && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded" style={{ transform: "translateZ(1px)" }} />
                {isStart(r, c, part) && (
                  <motion.div className="absolute inset-0 flex flex-col items-center justify-center p-1 z-10 gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <span className="text-white text-xs drop-shadow-md text-center break-words line-clamp-1">{part.name}</span>
                    {part.cropName && <span className="text-white text-[10px] drop-shadow-md text-center break-words line-clamp-1 px-1 py-0.5 bg-black/20 rounded">{part.cropName}</span>}
                  </motion.div>
                )}
                <div className="absolute inset-0 rounded shadow-inner opacity-20" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(255,255,255,0.2)" }} />
              </>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}


