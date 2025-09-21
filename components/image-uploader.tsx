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
    <div className="space-y-3 sm:space-y-4">
      {!image ? (
        <div
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center h-48 sm:h-64 ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3 sm:mb-4" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 text-center px-2">
            <span className="hidden sm:inline">Drag and drop an image here, or click to select</span>
            <span className="sm:hidden">Tap to select an image</span>
          </p>
          <input type="file" accept="image/*" className="hidden" id="image-upload" onChange={handleFileChange} />
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3">
              Select Image
            </div>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={image || "/placeholder.svg"}
            alt="Uploaded fruit"
            className="w-full h-48 sm:h-64 object-contain rounded-lg border"
          />
          <Button 
            variant="destructive" 
            size="sm" 
            className="absolute top-2 right-2 h-8 w-8 p-0" 
            onClick={removeImage}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}

      {image && (
        <Button className="w-full text-sm">
          <Ruler className="mr-2 h-4 w-4" /> 
          <span className="hidden sm:inline">Analyze Size</span>
          <span className="sm:hidden">Analyze</span>
        </Button>
      )}
    </div>
  )
}
