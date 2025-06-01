"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Brain, Camera, Leaf } from "lucide-react"

type AnalysisType = "DISEASE_DETECTION" | "FRUIT_SIZING" | "CROP_RECOMMENDATION" | "SOIL_ANALYSIS"

export default function AIAnalysisPage() {
  const [file, setFile] = useState<File | null>(null)
  const [cropType, setCropType] = useState<string>("")
  const [analysisType, setAnalysisType] = useState<AnalysisType>("DISEASE_DETECTION")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // In a real app, you'd get this from authentication
  const farmerId = "farmer-profile-1"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select an image file")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("farmer_id", farmerId)

      if (cropType) {
        formData.append("crop_type", cropType)
      }

      const response = await fetch(`/api/ai?modelType=${analysisType}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze image")
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis")
    } finally {
      setLoading(false)
    }
  }

  const getAnalysisIcon = (type: AnalysisType) => {
    switch (type) {
      case "DISEASE_DETECTION":
        return <Leaf className="w-5 h-5" />
      case "FRUIT_SIZING":
        return <Camera className="w-5 h-5" />
      case "CROP_RECOMMENDATION":
        return <Brain className="w-5 h-5" />
      case "SOIL_ANALYSIS":
        return <Brain className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Crop Analysis</h1>
        <p className="text-muted-foreground">Upload images of your crops for AI-powered analysis and recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Upload for Analysis
            </CardTitle>
            <CardDescription>Select analysis type and upload an image</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="analysisType">Analysis Type</Label>
                <Select value={analysisType} onValueChange={(value) => setAnalysisType(value as AnalysisType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISEASE_DETECTION">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Disease Detection
                      </div>
                    </SelectItem>
                    <SelectItem value="FRUIT_SIZING">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Fruit Sizing
                      </div>
                    </SelectItem>
                    <SelectItem value="CROP_RECOMMENDATION">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Crop Recommendation
                      </div>
                    </SelectItem>
                    <SelectItem value="SOIL_ANALYSIS">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Soil Analysis
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type (Optional)</Label>
                <Input
                  id="cropType"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder="e.g., Tomato, Corn, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    {preview ? (
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Preview"
                        className="object-contain w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                      </div>
                    )}
                    <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">{error}</div>}
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={loading || !file} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  {getAnalysisIcon(analysisType)}
                  <span className="ml-2">Analyze Image</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getAnalysisIcon(result.report_type)}
                Analysis Results
              </CardTitle>
              <CardDescription>Confidence: {(result.confidence * 100).toFixed(1)}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Analysis</h3>
                <div className="p-4 bg-gray-50 rounded-md dark:bg-gray-800">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(result.analysis, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                <div className="p-4 bg-blue-50 rounded-md dark:bg-blue-900/20">
                  <pre className="text-sm overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(result.recommendations, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
