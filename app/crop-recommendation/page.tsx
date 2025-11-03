"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CloudRain, Thermometer, Gauge } from "lucide-react"
import { CropRecommendationChat } from "@/components/crop-recommendation-chat"
import { useState } from "react"

export default function CropRecommendationPage() {
  // Add form state for manual analysis
  const [manualForm, setManualForm] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  })
  const [manualLoading, setManualLoading] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)
  const [manualResult, setManualResult] = useState<any>(null)

  const handleManualInput = (field: string, value: string) => {
    setManualForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setManualError(null)
    setManualResult(null)
    // Validate all fields
    if (Object.values(manualForm).some((v) => !v)) {
      setManualError("Please fill in all fields.")
      return
    }
    setManualLoading(true)
    try {
      const response = await fetch("/api/ai/crop-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nitrogen: parseFloat(manualForm.nitrogen),
          phosphorus: parseFloat(manualForm.phosphorus),
          potassium: parseFloat(manualForm.potassium),
          temperature: parseFloat(manualForm.temperature),
          humidity: parseFloat(manualForm.humidity),
          ph: parseFloat(manualForm.ph),
          rainfall: parseFloat(manualForm.rainfall),
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get crop recommendation")
      }
      const data = await response.json()
      setManualResult(data)
    } catch (err: any) {
      setManualError(err.message || "An error occurred during analysis")
    } finally {
      setManualLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Crop Recommendation</h1>
        <Button>Run New Analysis</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soil pH</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5</div>
            <p className="text-xs text-muted-foreground">Optimal range: 6.0-7.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rainfall</CardTitle>
            <CloudRain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120mm</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24°C</div>
            <p className="text-xs text-muted-foreground">Average for the season</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ai" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai">AI Recommendation</TabsTrigger>
          <TabsTrigger value="manual">Manual Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Crop Recommendation</CardTitle>
              <CardDescription>
                Ask questions about what crops to plant based on your soil and weather conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CropRecommendationChat />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Soil Analysis</CardTitle>
              <CardDescription>Enter your soil parameters for crop recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 py-4" onSubmit={handleManualSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                    <Input id="nitrogen" placeholder="e.g., 40" value={manualForm.nitrogen} onChange={e => handleManualInput("nitrogen", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                    <Input id="phosphorus" placeholder="e.g., 50" value={manualForm.phosphorus} onChange={e => handleManualInput("phosphorus", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="potassium">Potassium (K)</Label>
                    <Input id="potassium" placeholder="e.g., 60" value={manualForm.potassium} onChange={e => handleManualInput("potassium", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ph">pH Level</Label>
                    <Input id="ph" placeholder="e.g., 6.5" value={manualForm.ph} onChange={e => handleManualInput("ph", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rainfall">Rainfall (mm)</Label>
                    <Input id="rainfall" placeholder="e.g., 120" value={manualForm.rainfall} onChange={e => handleManualInput("rainfall", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input id="temperature" placeholder="e.g., 24" value={manualForm.temperature} onChange={e => handleManualInput("temperature", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input id="humidity" placeholder="e.g., 65" value={manualForm.humidity} onChange={e => handleManualInput("humidity", e.target.value)} />
                </div>
                {manualError && <div className="text-red-500 text-sm">{manualError}</div>}
                {manualResult && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg dark:bg-green-900/20 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        Recommended Crop: {manualResult.recommendedCrop || manualResult.crop}
                      </div>
                      <div className="text-green-700 dark:text-green-300 mb-2">
                        Confidence: {typeof manualResult.confidence === 'number' ? (manualResult.confidence * 100).toFixed(1) + '%' : manualResult.confidence}
                      </div>
                      {manualResult.source && (
                        <div className="text-xs text-muted-foreground">
                          Source: {manualResult.source === 'mcb_backend' ? 'AI Model' : 'Fallback'}
                        </div>
                      )}
                    </div>
                    
                    {manualResult.reasoning && (
                      <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Analysis Details</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{manualResult.reasoning}</p>
                      </div>
                    )}
                    
                    {manualResult.alternatives && manualResult.alternatives.length > 0 && (
                      <div className="p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Alternative Crops</h4>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                          {manualResult.alternatives.join(', ')}
                        </div>
                      </div>
                    )}
                    
                    {manualResult.careInstructions && (
                      <div className="p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Care Instructions</h4>
                        <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                          {Object.entries(manualResult.careInstructions).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={manualLoading}>{manualLoading ? "Getting Recommendation..." : "Get Recommendation"}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Current Recommendation</CardTitle>
          <CardDescription>Based on your soil analysis and current weather conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-card p-6 text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-2">Corn</h3>
            <p className="text-muted-foreground mb-4">
              Corn thrives in your current soil conditions with pH 6.5 and adequate rainfall.
            </p>
            <Separator className="my-4" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Planting Season</p>
                <p className="text-muted-foreground">Spring</p>
              </div>
              <div>
                <p className="font-medium">Growth Period</p>
                <p className="text-muted-foreground">90-120 days</p>
              </div>
              <div>
                <p className="font-medium">Water Needs</p>
                <p className="text-muted-foreground">Moderate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
