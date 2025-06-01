"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Ruler } from "lucide-react"

export function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [image, setImage] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setImage(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
  }

  return (
    <div className="space-y-4">
      {!image ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-64 ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">Drag and drop an image here, or click to select</p>
          <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleFileChange} />
          <label htmlFor="image-upload">
            <Button variant="secondary" size="sm" className="cursor-pointer" as="span">
              Select Image
            </Button>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={image || "/placeholder.svg"}
            alt="Uploaded fruit"
            className="w-full h-64 object-contain rounded-lg border"
          />
          <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {image && (
        <Button className="w-full">
          <Ruler className="mr-2 h-4 w-4" /> Analyze Size
        </Button>
      )}
    </div>
  )
}
