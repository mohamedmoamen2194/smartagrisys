"use client"

import { useEffect, useMemo, useState } from "react"
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

function renderGrid(rows: number, cols: number, parts: GridPart[], onPartClick?: (p: GridPart) => void) {
  const grid: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null))
  parts.forEach((p) => {
    for (let r = p.startRow; r < Math.min(p.startRow + p.rows, rows); r++) {
      for (let c = p.startCol; c < Math.min(p.startCol + p.cols, cols); c++) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) grid[r][c] = p.id
      }
    }
  })

  const getPart = (r: number, c: number) => parts.find((p) => p.id === grid[r][c])
  const isStart = (r: number, c: number, p: GridPart) => p.startRow === r && p.startCol === c

  return (
    <div
      className="grid gap-1 p-4 bg-gradient-to-br from-green-200 via-green-300 to-green-200 rounded-xl border-4 border-amber-900 shadow"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0,1fr))` }}
    >
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const part = getPart(r, c)
        return (
          <div
            key={`${r}-${c}`}
            onClick={() => part && onPartClick?.(part)}
            className={cn("relative aspect-square rounded", part ? "cursor-pointer" : "bg-green-100/50")}
            style={{ backgroundColor: part ? part.color : undefined, opacity: part ? 1 : 0.3 }}
            title={part ? `${part.name}${part.cropName ? ` • ${part.cropName}` : ""}` : undefined}
          >
            {part && isStart(r, c, part) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                <span className="text-white text-xs drop-shadow font-semibold text-center line-clamp-1">{part.name}</span>
                {part.cropName && (
                  <span className="mt-0.5 text-[10px] text-white/90 bg-black/25 rounded px-1 py-0.5 line-clamp-1">{part.cropName}</span>
                )}
              </div>
            )}
          </div>
        )
      })}
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
    // determine grid bounds from parts geometries; expect geometry like {startRow,startCol,rows,cols,color,cropName}
    let maxRow = 0
    let maxCol = 0
    const mapped: GridPart[] = (parts || []).map((p, idx) => {
      const g = p.geometry || {}
      const startRow = Number(g.startRow ?? 0)
      const startCol = Number(g.startCol ?? 0)
      const r = Number(g.rows ?? 1)
      const c = Number(g.cols ?? 1)
      maxRow = Math.max(maxRow, startRow + r)
      maxCol = Math.max(maxCol, startCol + c)
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
    const baseRows = Number(farmMeta?.gridRows ?? 0)
    const baseCols = Number(farmMeta?.gridCols ?? 0)
    return { rows: Math.max(3, baseRows, maxRow || 10), cols: Math.max(3, baseCols, maxCol || 10), gridParts: mapped }
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
            <FarmPartsGrid
              rows={rows}
              cols={cols}
              parts={gridParts as unknown as FarmPartModel[]}
              selectedPartId={selectedPartId}
              onPartClick={(p) => setSelectedPartId(p.id)}
            />
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


