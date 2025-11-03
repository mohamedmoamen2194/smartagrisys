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

interface FarmGridProps {
  rows: number
  cols: number
  parts: GridPart[]
  onPartClick?: (p: GridPart) => void
}

const FarmGrid = ({ rows, cols, parts, onPartClick }: FarmGridProps) => {
  const grid = useMemo(() => {
    const newGrid: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null))
    
    parts.forEach((p) => {
      for (let r = p.startRow; r < Math.min(p.startRow + p.rows, rows); r++) {
        for (let c = p.startCol; c < Math.min(p.startCol + p.cols, cols); c++) {
          if (r >= 0 && r < rows && c >= 0 && c < cols) newGrid[r][c] = p.id
        }
      }
    })
    
    return newGrid
  }, [rows, cols, parts])

  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const partId = grid[r]?.[c]
      const part = parts.find((p) => p.id === partId)
      const isStart = part && part.startRow === r && part.startCol === c
      
      // Check borders - if adjacent cell has different part, add border (not at grid edges)
      const topDifferent = r > 0 && grid[r - 1]?.[c] !== partId && partId !== null
      const bottomDifferent = r < rows - 1 && grid[r + 1]?.[c] !== partId && partId !== null
      const leftDifferent = c > 0 && grid[r]?.[c - 1] !== partId && partId !== null
      const rightDifferent = c < cols - 1 && grid[r]?.[c + 1] !== partId && partId !== null
      
      cells.push(
        <div
          key={`${r}-${c}`}
          onClick={() => part && onPartClick?.(part)}
          className={cn(
            "relative transition-all duration-200 w-full h-full",
            part 
              ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg" 
              : "bg-green-50/40 dark:bg-green-900/20 border border-green-200/30 dark:border-green-800/30"
          )}
          style={{
            backgroundColor: part ? part.color : undefined, 
            opacity: part ? 1 : 1,
            gridRow: r + 1,
            gridColumn: c + 1,
            borderTop: topDifferent ? '3px solid rgba(255, 255, 255, 0.6)' : undefined,
            borderBottom: bottomDifferent ? '3px solid rgba(255, 255, 255, 0.6)' : undefined,
            borderLeft: leftDifferent ? '3px solid rgba(255, 255, 255, 0.6)' : undefined,
            borderRight: rightDifferent ? '3px solid rgba(255, 255, 255, 0.6)' : undefined
          }}
          title={part ? `${part.name}${part.cropName ? ` • ${part.cropName}` : ""}` : undefined}
        >
          {part && isStart && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
              <span className="text-white text-sm font-bold drop-shadow-lg text-center line-clamp-2">
                {part.name}
              </span>
              {part.cropName && (
                <span className="mt-1 text-xs text-white/95 bg-black/30 rounded-md px-2 py-1 line-clamp-1 backdrop-blur-sm">
                  {part.cropName}
                </span>
              )}
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className="p-4 w-full h-full flex items-center justify-center">
      <div
        className="grid gap-2 bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 dark:from-green-950 dark:via-green-900 dark:to-emerald-950 rounded-2xl shadow-xl p-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          width: '90%',
          height: '70vh',
          maxWidth: '1200px'
        }}
      >
        {cells}
      </div>
    </div>
  )
}

export function FarmVisualization() {
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
      gridParts: mapped 
    }
  }, [parts, farmMeta])

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">My Farms</CardTitle>
            <CardDescription className="text-xs">Select a farm to view its layout</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select farm" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Add Farm</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Farm</DialogTitle>
                  <DialogDescription>Provide basic information to create a new farm.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="farm-name" className="text-right">Name</Label>
                    <Input id="farm-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="farm-location" className="text-right">Location</Label>
                    <Input id="farm-location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-2">
                    <Label htmlFor="farm-area" className="text-right">Area (ha)</Label>
                    <Input id="farm-area" type="number" step="0.01" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
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
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} disabled={!selectedFarmId}>Edit Layout</Button>
            <Button size="sm" variant="outline" onClick={() => {
              setEfName(farmMeta?.name || (farms.find(f=>f.id===selectedFarmId)?.name ?? ""))
              setEfRows(String(farmMeta?.gridRows ?? rows))
              setEfCols(String(farmMeta?.gridCols ?? cols))
              setEditFarmOpen(true)
            }} disabled={!selectedFarmId}>Edit Farm</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-3">
        {error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : farms.length === 0 ? (
          <div className="text-sm text-muted-foreground">No farms yet. Create one to begin.</div>
        ) : (
          <div className="w-full md:w-2/3 lg:w-1/2 mx-auto">
            <div className="overflow-auto p-2 w-full">
              <FarmGrid 
                rows={rows}
                cols={cols}
                parts={gridParts}
                onPartClick={(part) => {
                  setSelectedPartId(part.id)
                  setEditOpen(true)
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl w-[90vw] max-h-[70vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Farm Layout</DialogTitle>
            <DialogDescription>Manage parts of the selected farm.</DialogDescription>
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
            <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={editFarmOpen} onOpenChange={setEditFarmOpen}>
        <DialogContent className="max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle>Edit Farm</DialogTitle>
            <DialogDescription>Update farm name and grid dimensions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Name</Label>
              <Input className="col-span-3" value={efName} onChange={(e)=>setEfName(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Rows</Label>
              <Input className="col-span-3" type="number" min={3} max={50} value={efRows} onChange={(e)=>setEfRows(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">Cols</Label>
              <Input className="col-span-3" type="number" min={3} max={50} value={efCols} onChange={(e)=>setEfCols(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setEditFarmOpen(false)}>Cancel</Button>
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
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


