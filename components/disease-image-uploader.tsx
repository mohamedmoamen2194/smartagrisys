"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Microscope } from "lucide-react"

interface DiseaseImageUploaderProps {
  onResult?: (result: any) => void
  onError?: (error: string) => void
  onLoading?: (loading: boolean) => void
}

export function DiseaseImageUploader({ onResult, onError, onLoading }: DiseaseImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
        setImage(file)
        setPreview(URL.createObjectURL(file))
        setError(null)
        onResult?.(null) // Clear results in parent
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setError(null)
      onResult?.(null) // Clear results in parent
    }
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
    setError(null)
    onResult?.(null) // Clear results in parent
  }

  const handleAnalyze = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    onLoading?.(true)
    try {
      const formData = new FormData()
      formData.append("image", image)
      const response = await fetch("/api/ai/disease-detection", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze image")
      }
      const data = await response.json()
      onResult?.(data)
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred during analysis"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
      onLoading?.(false)
    }
  }

  return (
    <div className="space-y-4">
      {!preview ? (
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
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="disease-image-upload"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <Button
            variant="secondary"
            size="sm"
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Image
          </Button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview || "/placeholder.svg"}
            alt="Uploaded plant"
            className="w-full h-64 object-contain rounded-lg border"
          />
          <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {preview && (
        <Button className="w-full" onClick={handleAnalyze} disabled={loading}>
          {loading ? (
            <>
              <Microscope className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Microscope className="mr-2 h-4 w-4" /> Analyze Disease
            </>
          )}
        </Button>
      )}

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">{error}</div>
      )}
    </div>
  )
} 