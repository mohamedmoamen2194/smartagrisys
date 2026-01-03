"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Microscope, AlertTriangle, CheckCircle, Camera, ImageIcon } from "lucide-react"
import { DiseaseImageUploader } from "@/components/disease-image-uploader"

export default function DiseaseDetectionPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="mx-auto py-6 px-4 w-full max-w-6xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">Disease Detection</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="camera">Use Camera</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <Card className="shadow rounded-lg overflow-hidden">
                <CardHeader>
                  <CardTitle>Upload Plant Image</CardTitle>
                  <CardDescription>Upload an image of your plants for disease detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <DiseaseImageUploader 
                    onResult={setResult}
                    onError={setError}
                    onLoading={setLoading}
                  />
                </CardContent>
              </Card>

              {result && !loading && !error && (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                    <div className="text-center">
                      <div className="text-xl font-semibold text-green-700 dark:text-green-700">
                        {result.disease}
                      </div>
                      {typeof result.confidence === 'number' && (
                        <div className="text-sm text-green-800/80 dark:text-green-800/80 mt-1">
                          Confidence: {(result.confidence * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>

                  {result.treatment && result.treatment.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">Treatment Recommendations</h4>
                      <ul className="text-sm text-green-800/90 dark:text-green-800/90 space-y-1">
                        {result.treatment.map((treatment: string, index: number) => (
                          <li key={index}>• {treatment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="camera" className="space-y-4">
              <Card className="shadow rounded-lg overflow-hidden">
                <CardHeader>
                  <CardTitle>Capture Image</CardTitle>
                  <CardDescription>Use your camera to take a picture of your plants</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <ImageIcon className="h-24 w-24 text-muted-foreground" />
                  </div>
                  <Button className="w-full sm:w-auto">
                    <Camera className="mr-2 h-4 w-4" /> Capture Image
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="shadow rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Disease detection results will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <Microscope className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing image for diseases...
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="text-center p-6 rounded-lg bg-green-900/10 dark:bg-green-50">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-700 mb-2">
                      {result.disease}
                    </div>
                    <div className="text-green-800/80 dark:text-green-800/80 mb-2">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </div>
                    {result.source && (
                      <div className="text-xs text-muted-foreground">
                        Source: {result.source === 'local_pipeline' ? 'AI Model' : result.source === 'fallback' ? 'Fallback' : 'Local Pipeline'}
                      </div>
                    )}
                  </div>
                  
                  {result.reasoning && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">Analysis Details</h4>
                      <p className="text-sm text-green-800/90 dark:text-green-800/90">{result.reasoning}</p>
                    </div>
                  )}
                  
                  {result.severity && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">Severity: {result.severity.toUpperCase()}</h4>
                    </div>
                  )}
                  
                  {result.treatment && result.treatment.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">Treatment Recommendations</h4>
                      <ul className="text-sm text-green-800/90 dark:text-green-800/90 space-y-1">
                        {result.treatment.map((treatment: string, index: number) => (
                          <li key={index}>• {treatment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.symptoms && result.symptoms.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">Symptoms</h4>
                      <ul className="text-sm text-green-800/90 dark:text-green-800/90 space-y-1">
                        {result.symptoms.map((symptom: string, index: number) => (
                          <li key={index}>• {symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.nextSteps && result.nextSteps.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">Next Steps</h4>
                      <ul className="text-sm text-green-800/90 dark:text-green-800/90 space-y-1">
                        {result.nextSteps.map((step: string, index: number) => (
                          <li key={index}>• {step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : error ? (
                <div className="text-center py-8 sm:py-12">
                  <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Microscope className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Upload an image to start disease analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
