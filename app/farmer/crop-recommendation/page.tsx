"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Brain, Leaf, Thermometer, Droplets, CloudRain, Upload } from "lucide-react"

export default function CropRecommendationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form state for soil and environmental parameters
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that all fields are filled
    const values = Object.values(formData)
    if (values.some(value => !value)) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Convert form data to the format expected by the model
      const features = [
        parseFloat(formData.nitrogen),
        parseFloat(formData.phosphorus),
        parseFloat(formData.potassium),
        parseFloat(formData.temperature),
        parseFloat(formData.humidity),
        parseFloat(formData.ph),
        parseFloat(formData.rainfall)
      ]

      const response = await fetch("/api/ai/crop-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get crop recommendation")
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crop Recommendation</h1>
        <p className="text-muted-foreground">
          Enter your soil and environmental parameters to get AI-powered crop recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Soil & Environmental Parameters
            </CardTitle>
            <CardDescription>
              Enter your soil test results and current environmental conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                  <Input
                    id="nitrogen"
                    type="number"
                    step="0.1"
                    value={formData.nitrogen}
                    onChange={(e) => handleInputChange("nitrogen", e.target.value)}
                    placeholder="e.g., 19"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                  <Input
                    id="phosphorus"
                    type="number"
                    step="0.1"
                    value={formData.phosphorus}
                    onChange={(e) => handleInputChange("phosphorus", e.target.value)}
                    placeholder="e.g., 65"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="potassium">Potassium (K)</Label>
                  <Input
                    id="potassium"
                    type="number"
                    step="0.1"
                    value={formData.potassium}
                    onChange={(e) => handleInputChange("potassium", e.target.value)}
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    <Thermometer className="w-4 h-4 inline mr-1" />
                    Temperature (°C)
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange("temperature", e.target.value)}
                    placeholder="e.g., 18.88"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="humidity">
                    <Droplets className="w-4 h-4 inline mr-1" />
                    Humidity (%)
                  </Label>
                  <Input
                    id="humidity"
                    type="number"
                    step="0.1"
                    value={formData.humidity}
                    onChange={(e) => handleInputChange("humidity", e.target.value)}
                    placeholder="e.g., 18"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ph">pH Level</Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    value={formData.ph}
                    onChange={(e) => handleInputChange("ph", e.target.value)}
                    placeholder="e.g., 5.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rainfall">
                  <CloudRain className="w-4 h-4 inline mr-1" />
                  Rainfall (mm)
                </Label>
                <Input
                  id="rainfall"
                  type="number"
                  step="0.1"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange("rainfall", e.target.value)}
                  placeholder="e.g., 144"
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">
                  {error}
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Get Recommendation
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
                <Leaf className="w-5 h-5" />
                Recommended Crop
              </CardTitle>
              <CardDescription>Based on your soil and environmental conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-green-50 rounded-lg dark:bg-green-900/20">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {result.crop}
                </div>
                <p className="text-green-700 dark:text-green-300">
                  This crop is well-suited for your current conditions
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Why this crop?</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    • <strong>Nitrogen ({formData.nitrogen}):</strong> {result.crop} thrives with this nitrogen level
                  </p>
                  <p>
                    • <strong>pH ({formData.ph}):</strong> Optimal pH range for {result.crop}
                  </p>
                  <p>
                    • <strong>Temperature ({formData.temperature}°C):</strong> Ideal growing temperature
                  </p>
                  <p>
                    • <strong>Rainfall ({formData.rainfall}mm):</strong> Sufficient water availability
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
