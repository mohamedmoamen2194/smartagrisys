"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PartEditor } from "@/components/farm/part-editor"
import { cn } from "@/lib/utils"
import { FarmPartsGrid } from "@/components/farm/farm-parts-grid"
import { FarmPartModel, getColor } from "@/components/farm/farm-part"
import { useTranslations } from "@/hooks/useTranslations"

type ApiFarm = { id: string; name: string }
type ApiFarmPart = {
  id: string
  name: string
  geometry: any
  metadata?: any
}

type GridPart = {
  id: string
  name: string
  startRow: number
  startCol: number
  rows: number
  cols: number
  color: string
  cropName?: string
}

/**
 * 3D farm layout types derived from the external Farm Dashboard Component.
 * These are kept local to this file so we can swap the visualization
 * without touching the existing backend or editor logic.
 */

type PlotStatus = "healthy" | "warning" | "critical"

type PlotType = "crop" | "building" | "animal" | "empty"

type Plot3D = {
  id: string
  x: number
  y: number
  width: number
  height: number
  type: PlotType
  content: string
  name: string
  status?: PlotStatus
  growthStage?: number
  cropName?: string
}

type Farm3DLayoutProps = {
  plots: Plot3D[]
  onSelectPlot?: (id: string) => void
  rows: number
  cols: number
  onChangePlotRect?: (
    id: string,
    rect: { startRow: number; startCol: number; rows: number; cols: number },
    options?: { commit?: boolean }
  ) => void
}

const Farm3DLayout = ({
  plots,
  onSelectPlot,
  rows,
  cols,
  onChangePlotRect,
}: Farm3DLayoutProps) => {
  // Fixed cell size - parts maintain this size regardless of grid dimensions
  const plotSize = 120
  const spacing = 130
  
  // Calculate container size based on grid dimensions to ensure parts maintain fixed size
  // Add extra padding so parts don't get clipped
  const containerWidth = Math.max(800, cols * spacing + spacing)
  const containerHeight = Math.max(500, rows * spacing + spacing)

  return (
    <div className="relative overflow-visible" style={{ minHeight: "420px", maxHeight: "600px" }}>
      {/* isometric farm grid container (no background panel, parts appear to float) */}
      <div
        className="relative mx-auto"
        style={{
          width: `${containerWidth}px`,
          maxWidth: "100%",
          height: `${containerHeight}px`,
          transform: "rotateX(60deg) rotateZ(45deg) scale(0.8)",
          transformStyle: "preserve-3d",
        }}
      >
        {plots.map((plot) => (
          <FarmPlot3D
            key={plot.id}
            plot={plot}
            maxRows={rows}
            maxCols={cols}
            onClick={() => onSelectPlot?.(plot.id)}
            onChangeRect={(rect, options) =>
              onChangePlotRect?.(
                plot.id,
                {
                  startRow: rect.startRow,
                  startCol: rect.startCol,
                  rows: rect.rows,
                  cols: rect.cols,
                },
                options
              )
            }
          />
        ))}
      </div>
    </div>
  )
}

type FarmPlot3DProps = {
  plot: Plot3D
  onClick?: () => void
}

const FarmPlot3D = ({
  plot,
  onClick,
  maxRows,
  maxCols,
  onChangeRect,
}: FarmPlot3DProps & {
  maxRows: number
  maxCols: number
  onChangeRect?: (
    rect: {
      startRow: number
      startCol: number
      rows: number
      cols: number
    },
    options?: { commit?: boolean }
  ) => void
}) => {
  const { t } = useTranslations()
  const [isHovered, setIsHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [originGrid, setOriginGrid] = useState<{
    startRow: number
    startCol: number
    rows: number
    cols: number
  } | null>(null)
  const lastRectRef = React.useRef<{
    startRow: number
    startCol: number
    rows: number
    cols: number
  } | null>(null)

  const plotSize = 120
  const spacing = 130

  // Calculate 3D isometric position
  const left = plot.x * spacing
  const top = plot.y * spacing
  const width = plot.width * plotSize + (plot.width - 1) * 10
  const height = plot.height * plotSize + (plot.height - 1) * 10

  const getPlotColor = () => {
    switch (plot.type) {
      case "crop":
        return "#8B4513" // Brown soil
      case "building":
        return "#94a3b8" // Gray foundation
      case "animal":
        return "#65a30d" // Green grass
      case "empty":
        return "#a16207" // Light brown
      default:
        return "#8B4513"
    }
  }

  const getFenceColor = () => {
    switch (plot.status) {
      case "warning":
        return "#fbbf24"
      case "critical":
        return "#ef4444"
      default:
        return "#d4a574"
    }
  }

  const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    // clicking a tile no longer opens the edit card; interaction is purely drag/resize
  }

  const beginDrag: React.MouseEventHandler<HTMLDivElement> = (e) => {
    // ignore if starting on resize handle
    if ((e.target as HTMLElement).dataset.resizeHandle === "true") return
    setDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setOriginGrid({
      startRow: plot.y,
      startCol: plot.x,
      rows: plot.height,
      cols: plot.width,
    })
  }

  const handlePointerMove = (clientX: number, clientY: number) => {
    if ((!dragging && !resizing) || !dragStart || !originGrid) return

    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y

    if (dragging) {
      let newCol = originGrid.startCol + Math.round(deltaX / spacing)
      let newRow = originGrid.startRow + Math.round(deltaY / spacing)

      newCol = Math.max(0, Math.min(maxCols - originGrid.cols, newCol))
      newRow = Math.max(0, Math.min(maxRows - originGrid.rows, newRow))

      const rect = {
        startRow: newRow,
        startCol: newCol,
        rows: originGrid.rows,
        cols: originGrid.cols,
      }
      lastRectRef.current = rect
      onChangeRect?.(rect, { commit: false })
      return
    }

    if (resizing) {
      const cellSize = plotSize + 10
      let newCols =
        originGrid.cols + Math.round(deltaX / cellSize)
      let newRows =
        originGrid.rows + Math.round(deltaY / cellSize)

      newCols = Math.max(1, Math.min(maxCols - originGrid.startCol, newCols))
      newRows = Math.max(1, Math.min(maxRows - originGrid.startRow, newRows))

      const rect = {
        startRow: originGrid.startRow,
        startCol: originGrid.startCol,
        rows: newRows,
        cols: newCols,
      }
      lastRectRef.current = rect
      onChangeRect?.(rect, { commit: false })
    }
  }

  const endInteraction = () => {
    if (lastRectRef.current) {
      onChangeRect?.(lastRectRef.current, { commit: true })
    }
    setDragging(false)
    setResizing(false)
    setDragStart(null)
    setOriginGrid(null)
    lastRectRef.current = null
  }

  const beginResize: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    setResizing(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setOriginGrid({
      startRow: plot.y,
      startCol: plot.x,
      rows: plot.height,
      cols: plot.width,
    })
  }

  // Track dragging/resizing even if pointer leaves the tile by listening on window
  React.useEffect(() => {
    if (!dragging && !resizing) return

    const handleMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY)
    }
    const handleUp = () => {
      endInteraction()
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [dragging, resizing, dragStart, originGrid, maxRows, maxCols, onChangeRect])

  return (
    <div
      className="absolute cursor-move transition-all duration-200"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        transformStyle: "preserve-3d",
        transform:
          isHovered || dragging || resizing
            ? "translateZ(20px)"
            : "translateZ(0px)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={beginDrag}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onClick={handleClick}
    >
      {/* 3D Plot Base */}
      <div
        className="absolute inset-0 rounded-lg shadow-2xl"
        style={{
          backgroundColor: getPlotColor(),
          transform: "translateZ(-20px)",
          border: "2px solid rgba(0,0,0,0.2)",
        }}
      />

      {/* Side walls for depth */}
      <div
        className="absolute left-0 top-0"
        style={{
          width: "20px",
          height: "100%",
          background:
            "linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.1))",
          transform: "rotateY(-90deg) translateZ(0px)",
          transformOrigin: "left",
        }}
      />
      <div
        className="absolute right-0 top-0"
        style={{
          width: "20px",
          height: "100%",
          background:
            "linear-gradient(to left, rgba(0,0,0,0.3), rgba(0,0,0,0.1))",
          transform: "rotateY(90deg) translateZ(0px)",
          transformOrigin: "right",
        }}
      />
      <div
        className="absolute left-0 bottom-0"
        style={{
          width: "100%",
          height: "20px",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.3), rgba(0,0,0,0.1))",
          transform: "rotateX(90deg) translateZ(0px)",
          transformOrigin: "bottom",
        }}
      />
      <div
        className="absolute left-0 top-0"
        style={{
          width: "100%",
          height: "20px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.1))",
          transform: "rotateX(-90deg) translateZ(0px)",
          transformOrigin: "top",
        }}
      />

      {/* Top surface */}
      <div
        className="absolute inset-0 rounded-lg flex items-center justify-center overflow-hidden"
        style={{
          // base soil tone for edges
          backgroundColor: getPlotColor(),
          border: `3px solid ${getFenceColor()}`,
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.25)",
        }}
      >
        {/* 3D grass surface covering the tile */}
        <Grass3D />

        {/* resize handle (bottom-right) */}
        <div
          data-resize-handle="true"
          className="absolute right-1 bottom-1 w-3 h-3 rounded-sm bg-white/90 shadow-md cursor-se-resize"
          style={{ transform: "translateZ(30px)" }}
          onMouseDown={beginResize}
        />
      </div>

      {/* hover-only info: part name, crop, and basic insights (above tile, vertical/not tilted) */}
      {isHovered && (
        <div
          className="absolute left-1/2 -top-2 px-3 py-2 rounded-md border text-xs shadow-lg max-w-[220px]"
          style={{
            // Counter-rotate to cancel parent's isometric rotation so the box appears vertical
            transform: "translate(-50%, -100%) translateZ(40px) rotateZ(-45deg) rotateX(-60deg)",
            transformStyle: "preserve-3d",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            zIndex: 50,
          }}
        >
          <div className="font-semibold mb-1 truncate">
            {plot.name}
            {plot.cropName ? ` • ${plot.cropName}` : ""}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {plot.cropName
              ? `${plot.cropName} - ${t("farm.healthyCropField")}`
              : t("farm.noInsights")}
          </div>
            </div>
          )}

      {/* simple corner posts */}
      <div
        className="absolute -left-1 -top-1 w-2 h-8 bg-amber-800 rounded"
        style={{ transform: "translateZ(5px)" }}
      />
      <div
        className="absolute -right-1 -top-1 w-2 h-8 bg-amber-800 rounded"
        style={{ transform: "translateZ(5px)" }}
      />
      <div
        className="absolute -left-1 -bottom-1 w-2 h-8 bg-amber-800 rounded"
        style={{ transform: "translateZ(5px)" }}
      />
      <div
        className="absolute -right-1 -bottom-1 w-2 h-8 bg-amber-800 rounded"
        style={{ transform: "translateZ(5px)" }}
      />
        </div>
      )
    }

// Simple 3D grass surface used for all parts

const Grass3D = () => {
  return (
    <div
      className="relative w-full h-full"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* base ground using external scanned grass texture */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          backgroundImage: "url('/textures/wild-grass-basecolor.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow:
            "inset 0 3px 6px rgba(255,255,255,0.25), inset 0 -6px 10px rgba(0,0,0,0.35)",
          transform: "translateZ(4px)",
        }}
      />

      {/* clumps of grass (leaf-like shapes) across the tile */}
      <div className="absolute inset-[6%]">
        {Array.from({ length: 12 }).map((_, idx) => {
          const row = Math.floor(idx / 4)
          const col = idx % 4
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `${row * 26}%`,
                left: `${col * 26}%`,
                width: "18px",
                height: "18px",
                transform: `translateZ(8px)`,
              }}
            >
              {/* three leaves per clump */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "45%",
                  width: "5px",
                  height: "16px",
                  background:
                    "linear-gradient(to top, #14532d, #22c55e, #bbf7d0)",
                  borderRadius: "999px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  transform: "translateX(-50%) rotateZ(-8deg)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "35%",
                  width: "4px",
                  height: "13px",
                  background:
                    "linear-gradient(to top, #14532d, #16a34a, #a7f3d0)",
                  borderRadius: "999px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.45)",
                  transform: "translateX(-50%) rotateZ(16deg)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: "20%",
                  width: "4px",
                  height: "12px",
                  background:
                    "linear-gradient(to top, #14532d, #16a34a, #bbf7d0)",
                  borderRadius: "999px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
                  transform: "translateX(50%) rotateZ(-18deg)",
                }}
              />
            </div>
          )
        })}
      </div>

      {/* soft noise-like texture over everything */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 3px)",
          opacity: 0.6,
          mixBlendMode: "soft-light",
          transform: "translateZ(10px)",
        }}
      />

      {/* taller foreground blades near the front edge */}
      <div className="absolute left-0 right-0 bottom-1 flex justify-around px-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "3px",
              height: `${14 + ((i * 7) % 12)}px`,
              background:
                "linear-gradient(to top, #14532d, #22c55e, #bbf7d0)",
              borderRadius: "999px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.65)",
              transform: `translateZ(12px) rotateZ(${(i % 3) - 2}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function FarmVisualization() {
  const { t } = useTranslations()
  const [farms, setFarms] = useState<ApiFarm[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState<string>("")
  const [parts, setParts] = useState<ApiFarmPart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editFarmOpen, setEditFarmOpen] = useState(false)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [areaHa, setAreaHa] = useState<string>("")
  const [creating, setCreating] = useState(false)
  const [selectedPartId, setSelectedPartId] = useState<string | undefined>(undefined)
  const [farmMeta, setFarmMeta] = useState<{ gridRows?: number; gridCols?: number; name?: string } | null>(null)
  const [efName, setEfName] = useState("")
  const [efRows, setEfRows] = useState<string>("")
  const [efCols, setEfCols] = useState<string>("")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      setError("Unauthorized")
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/farms", { headers: { authorization: user } })
        if (!res.ok) throw new Error(await res.text())
        const list = await res.json()
        setFarms(list)
        if (list.length) setSelectedFarmId(list[0].id)
      } catch (e: any) {
        setError(e?.message || "Failed to load farms")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!selectedFarmId) return
    const user = localStorage.getItem("user")
    if (!user) return
    ;(async () => {
      try {
        const res = await fetch(`/api/farms/${selectedFarmId}`, { headers: { authorization: user } })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setParts(data?.parts ?? [])
        setFarmMeta({
          gridRows: data?.metadata?.gridRows,
          gridCols: data?.metadata?.gridCols,
          name: data?.name,
        })
      } catch (e) {
        // swallow for now
      }
    })()
  }, [selectedFarmId])

  const { rows, cols, gridParts } = useMemo(() => {
    // Use the farm metadata dimensions or default to 6x6
    const baseRows = Math.max(1, Number(farmMeta?.gridRows ?? 6))
    const baseCols = Math.max(1, Number(farmMeta?.gridCols ?? 6))
    
    // Process parts and ensure they fit within the grid
    const mapped: GridPart[] = (parts || []).map((p, idx) => {
      const g = p.geometry || {}
      const startRow = Math.min(Number(g.startRow ?? 0), baseRows - 1)
      const startCol = Math.min(Number(g.startCol ?? 0), baseCols - 1)
      const r = Math.min(Number(g.rows ?? 1), baseRows - startRow)
      const c = Math.min(Number(g.cols ?? 1), baseCols - startCol)
      
      return {
        id: p.id,
        name: p.name,
        startRow,
        startCol,
        rows: r,
        cols: c,
        color: g.color || getColor(idx),
        cropName: g.cropName,
      }
    })
    
    return { 
      rows: baseRows, 
      cols: baseCols, 
      gridParts: mapped,
    }
  }, [parts, farmMeta])

  const plots3d: Plot3D[] = useMemo(
    () =>
      gridParts.map((p, idx) => {
        const hasCrop = !!p.cropName
        const lowerCrop = p.cropName?.toLowerCase().trim() || ""

        let type: PlotType = "empty"
        let content = ""

        if (hasCrop) {
          type = "crop"
          content = lowerCrop || "crop"
        } else if (/barn|silo|house|shed|workshop|store/i.test(p.name)) {
          type = "building"
          content = /silo/i.test(p.name) ? "silo" : "barn"
        } else {
          type = "crop"
          content = "crop"
        }

        const status: PlotStatus = "healthy"

        return {
          id: p.id,
          x: p.startCol,
          y: p.startRow,
          width: Math.max(1, p.cols),
          height: Math.max(1, p.rows),
          type,
          content,
          name: p.name,
          status,
        growthStage: hasCrop ? 70 : undefined,
        cropName: p.cropName,
        }
      }),
    [gridParts]
  )

  const updatePartRectFrom3D = async (
    id: string,
    rect: { startRow: number; startCol: number; rows: number; cols: number },
    commit?: boolean
  ) => {
    const current = parts.find((x) => x.id === id)
    if (!current) return

    // Optimistic UI update so tiles move immediately while dragging
    setParts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              geometry: {
                ...(p.geometry || {}),
                startRow: rect.startRow,
                startCol: rect.startCol,
                rows: rect.rows,
                cols: rect.cols,
              },
            }
          : p
      )
    )

    if (!commit) {
      // during live drag/resize we only update local state for smoothness
      return
    }

    const user = localStorage.getItem("user")
    if (!user) return

    try {
      await fetch(`/api/parts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", authorization: user },
        body: JSON.stringify({
          name: current.name,
          geometry: {
            ...(current.geometry || {}),
            startRow: rect.startRow,
            startCol: rect.startCol,
            rows: rect.rows,
            cols: rect.cols,
          },
        }),
      })
      // we already updated state optimistically; no need to re-set on success
    } catch {
      // silent failure; you could add toast / rollback here if desired
    }
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{t("farm.myFarms")}</CardTitle>
            <CardDescription className="text-xs">{t("farm.selectFarmDescription")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={t("farm.selectFarm")} />
              </SelectTrigger>
              <SelectContent>
                {farms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">{t("farm.addFarm")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("farm.addFarmTitle")}</DialogTitle>
                  <DialogDescription>{t("farm.addFarmDescription")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="farm-name" className="text-right">{t("farm.name")}</Label>
                    <Input id="farm-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="farm-location" className="text-right">{t("farm.location")}</Label>
                    <Input id="farm-location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="farm-area" className="text-right">{t("farm.areaHa")}</Label>
                    <Input id="farm-area" type="number" step="0.01" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
                  <Button
                    onClick={async () => {
                      if (!name.trim()) return
                      try {
                        setCreating(true)
                        const user = localStorage.getItem("user")
                        if (!user) throw new Error("Unauthorized")
                        const res = await fetch("/api/farms", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", authorization: user },
                          body: JSON.stringify({ name, location: location || undefined, areaHa: areaHa ? Number(areaHa) : undefined }),
                        })
                        if (!res.ok) throw new Error(await res.text())
                        const farm = await res.json()
                        // refresh list
                        setFarms((prev) => [farm, ...prev])
                        setSelectedFarmId(farm.id)
                        setCreateOpen(false)
                        setName("")
                        setLocation("")
                        setAreaHa("")
                      } catch (e) {
                        // noop; you can add toast here
                      } finally {
                        setCreating(false)
                      }
                    }}
                    disabled={creating || !name.trim()}
                  >
                    {creating ? t("farm.creating") : t("farm.create")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} disabled={!selectedFarmId}>{t("farm.editLayout")}</Button>
            <Button size="sm" variant="outline" onClick={() => {
              setEfName(farmMeta?.name || (farms.find(f=>f.id===selectedFarmId)?.name ?? ""))
              setEfRows(String(farmMeta?.gridRows ?? rows))
              setEfCols(String(farmMeta?.gridCols ?? cols))
              setEditFarmOpen(true)
            }} disabled={!selectedFarmId}>{t("farm.editFarm")}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1 max-h-[600px] overflow-auto">
        {error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : loading ? (
          <div className="text-sm text-muted-foreground">{t("farm.loading")}</div>
        ) : farms.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t("farm.noFarms")}</div>
        ) : (
          <div className="w-full">
            <Farm3DLayout
              plots={plots3d}
                rows={rows}
                cols={cols}
              onChangePlotRect={(id, rect, options) => {
                updatePartRectFrom3D(id, rect, options?.commit)
              }}
              />
          </div>
        )}
      </CardContent>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl w-[90vw] max-h-[70vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{t("farm.editLayoutTitle")}</DialogTitle>
            <DialogDescription>{t("farm.editLayoutDescription")}</DialogDescription>
          </DialogHeader>
          <PartEditor
            parts={(gridParts as unknown as FarmPartModel[])}
            maxRows={rows}
            maxCols={cols}
            selectedPartId={selectedPartId}
            onSelectPart={(id) => setSelectedPartId(id)}
            onAddPart={async (p) => {
              if (!selectedFarmId) return
              const user = localStorage.getItem("user")
              if (!user) return
              const res = await fetch(`/api/farms/${selectedFarmId}/parts`, {
                method: "POST",
                headers: { "Content-Type": "application/json", authorization: user },
                body: JSON.stringify({ name: p.name, type: "FIELD", geometry: { startRow: p.startRow, startCol: p.startCol, rows: p.rows, cols: p.cols, color: p.color, character: p.character, cropName: p.cropName } }),
              })
              if (res.ok) {
                const created = await res.json()
                setParts((prev) => [{ ...created }, ...prev])
              }
            }}
            onUpdatePart={async (id, u) => {
              const user = localStorage.getItem("user")
              if (!user) return
              const current = parts.find((x) => x.id === id)
              if (!current) return
              const g = current.geometry || {}
              const geometry = { ...g, startRow: u.startRow ?? g.startRow, startCol: u.startCol ?? g.startCol, rows: u.rows ?? g.rows, cols: u.cols ?? g.cols, character: u.character ?? g.character, cropName: u.cropName ?? g.cropName }
              const res = await fetch(`/api/parts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", authorization: user }, body: JSON.stringify({ name: u.name ?? current.name, geometry }) })
              if (res.ok) {
                const updated = await res.json()
                setParts((prev) => prev.map((x) => (x.id === id ? updated : x)))
              }
            }}
            onDeletePart={async (id) => {
              const user = localStorage.getItem("user")
              if (!user) return
              const res = await fetch(`/api/parts/${id}`, { method: "DELETE", headers: { authorization: user } })
              if (res.ok) setParts((prev) => prev.filter((x) => x.id !== id))
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t("farm.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editFarmOpen} onOpenChange={setEditFarmOpen}>
        <DialogContent className="max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle>{t("farm.editFarmTitle")}</DialogTitle>
            <DialogDescription>{t("farm.editFarmDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">{t("farm.name")}</Label>
              <Input className="col-span-3" value={efName} onChange={(e)=>setEfName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">{t("farm.rows")}</Label>
              <Input className="col-span-3" type="number" min={3} max={50} value={efRows} onChange={(e)=>setEfRows(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">{t("farm.cols")}</Label>
              <Input className="col-span-3" type="number" min={3} max={50} value={efCols} onChange={(e)=>setEfCols(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setEditFarmOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={async ()=>{
              if(!selectedFarmId) return
              const user = localStorage.getItem("user"); if(!user) return
              const newMeta = { ...(farmMeta||{}), gridRows: Number(efRows)||rows, gridCols: Number(efCols)||cols }
              const res = await fetch(`/api/farms/${selectedFarmId}`, { method: 'PATCH', headers: { 'Content-Type':'application/json', authorization: user }, body: JSON.stringify({ name: efName || farmMeta?.name, metadata: newMeta }) })
              if(res.ok){
                const updated = await res.json()
                setFarmMeta({ gridRows: updated?.metadata?.gridRows, gridCols: updated?.metadata?.gridCols, name: updated?.name })
                setFarms(prev=> prev.map(f=> f.id===updated.id ? { ...f, name: updated.name } : f))
                setEditFarmOpen(false)
              }
            }}>{t("farm.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


