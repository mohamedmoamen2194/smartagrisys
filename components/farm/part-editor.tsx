"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, Trash2, Plus } from "lucide-react"
import { FarmPartModel, getColor } from "@/components/farm/farm-part"

type Props = {
  parts: FarmPartModel[]
  maxRows: number
  maxCols: number
  selectedPartId?: string
  onSelectPart: (id: string) => void
  onAddPart: (part: Omit<FarmPartModel, "id" | "color"> & { color?: string }) => Promise<void>
  onUpdatePart: (id: string, updates: Partial<FarmPartModel>) => Promise<void>
  onDeletePart: (id: string) => Promise<void>
}

export function PartEditor({ parts, maxRows, maxCols, selectedPartId, onSelectPart, onAddPart, onUpdatePart, onDeletePart }: Props) {
  const [editingPart, setEditingPart] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", startRow: 0, startCol: 0, rows: 2, cols: 2, character: "", cropName: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingPart) {
      const p = parts.find((x) => x.id === editingPart)
      if (p) {
        setFormData({
          name: p.name,
          startRow: p.startRow,
          startCol: p.startCol,
          rows: p.rows,
          cols: p.cols,
          character: p.character || "",
          cropName: p.cropName || "",
        })
      }
    }
  }, [editingPart, parts])

  const handleAdd = async () => {
    try {
      setSaving(true)
      const color = getColor(parts.length)
      await onAddPart({
        name: formData.name || `Part ${parts.length + 1}`,
        startRow: formData.startRow,
        startCol: formData.startCol,
        rows: formData.rows,
        cols: formData.cols,
        character: formData.character || undefined,
        cropName: formData.cropName || undefined,
        color,
      })
      setFormData({ name: "", startRow: 0, startCol: 0, rows: 2, cols: 2, character: "", cropName: "" })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingPart) return
    try {
      setSaving(true)
      await onUpdatePart(editingPart, {
        name: formData.name,
        startRow: formData.startRow,
        startCol: formData.startCol,
        rows: formData.rows,
        cols: formData.cols,
        character: formData.character || undefined,
        cropName: formData.cropName || undefined,
      })
      setEditingPart(null)
      setFormData({ name: "", startRow: 0, startCol: 0, rows: 2, cols: 2, character: "", cropName: "" })
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingPart(null)
    setFormData({ name: "", startRow: 0, startCol: 0, rows: 2, cols: 2, character: "", cropName: "" })
  }

  return (
    <Card className="p-2 sm:p-3 space-y-3">
      <div>
        <h3 className="mb-2 font-semibold">{editingPart ? "Edit Part" : "Add New Part"}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Wheat Field" />
          </div>
          <div className="space-y-2">
            <Label>Character/Icon (optional)</Label>
            <Input value={formData.character} onChange={(e) => setFormData({ ...formData, character: e.target.value })} placeholder="e.g., 🌾 or W" maxLength={2} />
          </div>
          <div className="space-y-2">
            <Label>Crop Name (optional)</Label>
            <Input value={formData.cropName} onChange={(e) => setFormData({ ...formData, cropName: e.target.value })} placeholder="e.g., Tomato" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Row: {formData.startRow}</Label>
              <Slider value={[formData.startRow]} onValueChange={(v) => setFormData({ ...formData, startRow: v[0] })} min={0} max={Math.max(0, maxRows - 1)} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Start Col: {formData.startCol}</Label>
              <Slider value={[formData.startCol]} onValueChange={(v) => setFormData({ ...formData, startCol: v[0] })} min={0} max={Math.max(0, maxCols - 1)} step={1} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Height (rows): {formData.rows}</Label>
              <Slider value={[formData.rows]} onValueChange={(v) => setFormData({ ...formData, rows: v[0] })} min={1} max={Math.max(1, maxRows - formData.startRow)} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Width (cols): {formData.cols}</Label>
              <Slider value={[formData.cols]} onValueChange={(v) => setFormData({ ...formData, cols: v[0] })} min={1} max={Math.max(1, maxCols - formData.startCol)} step={1} />
            </div>
          </div>
          <div className="flex gap-2">
            {editingPart ? (
              <>
                <Button onClick={handleUpdate} disabled={saving} className="flex-1">Update Part</Button>
                <Button onClick={cancelEdit} variant="outline">Cancel</Button>
              </>
            ) : (
              <Button onClick={handleAdd} disabled={saving} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Part</Button>
            )}
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Farm Parts ({parts.length})</h3>
        <ScrollArea className="h-[200px] pr-2">
          <div className="space-y-2">
            {parts.map((part) => (
              <div key={part.id} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedPartId === part.id ? "border-yellow-400 bg-yellow-50" : "border-gray-200 hover:border-gray-300"}`} onClick={() => onSelectPart(part.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: part.cropColor || part.color }}>
                    {part.character || part.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{part.name}</div>
                    {part.cropName && <div className="text-xs truncate" style={{ color: part.cropColor || '#22c55e' }}>Crop: {part.cropName}</div>}
                    <div className="text-xs text-muted-foreground">Pos: ({part.startRow},{part.startCol}) • Size: {part.rows}×{part.cols}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingPart(part.id); onSelectPart(part.id) }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={async (e) => { e.stopPropagation(); await onDeletePart(part.id) }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {parts.length === 0 && <div className="text-center text-muted-foreground py-8">No parts yet. Add your first part above.</div>}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}


