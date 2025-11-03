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
import { FarmerPageHeader } from "@/components/farmer/page-header"

export default function DiseaseDetectionPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-6">
      <FarmerPageHeader
        title="Disease Detection"
        subtitle="Upload or capture plant images for AI-powered disease analysis"
        actions={<Badge variant="secondary" className="w-fit"><Microscope className="h-3 w-3 mr-1" />AI Powered</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div className="space-y-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload" className="text-xs sm:text-sm">
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Upload Image</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="camera" className="text-xs sm:text-sm">
                <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Use Camera</span>
                <span className="sm:hidden">Camera</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Upload Plant Image</CardTitle>
                  <CardDescription className="text-sm">
                    Upload a clear image of your plant leaves for accurate disease detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DiseaseImageUploader 
                    onResult={setResult}
                    onError={setError}
                    onLoading={setLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="camera" className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Capture Image</CardTitle>
                  <CardDescription className="text-sm">
                    Use your device camera to take a picture of affected plant parts
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <ImageIcon className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-muted-foreground" />
                  </div>
                  <Button className="w-full sm:w-auto">
                    <Camera className="mr-2 h-4 w-4" /> 
                    <span className="hidden sm:inline">Capture Image</span>
                    <span className="sm:hidden">Capture</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Analysis Results
              </CardTitle>
              <CardDescription className="text-sm">
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
                  <div className="text-center p-6 bg-green-50 rounded-lg dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {result.disease}
                    </div>
                    <div className="text-green-700 dark:text-green-300 mb-2">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </div>
                    {result.source && (
                      <div className="text-xs text-muted-foreground">
                        Source: {result.source === 'mcb_backend' ? 'AI Model' : 'Fallback'}
                      </div>
                    )}
                  </div>
                  
                  {result.reasoning && (
                    <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Analysis Details</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{result.reasoning}</p>
                    </div>
                  )}
                  
                  {result.severity && (
                    <div className="p-4 bg-orange-50 rounded-lg dark:bg-orange-900/20">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Severity: {result.severity.toUpperCase()}</h4>
                    </div>
                  )}
                  
                  {result.treatment && result.treatment.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-lg dark:bg-red-900/20">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Treatment Recommendations</h4>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        {result.treatment.map((treatment: string, index: number) => (
                          <li key={index}>• {treatment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.symptoms && result.symptoms.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg dark:bg-yellow-900/20">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Symptoms</h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        {result.symptoms.map((symptom: string, index: number) => (
                          <li key={index}>• {symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.nextSteps && result.nextSteps.length > 0 && (
                    <div className="p-4 bg-purple-50 rounded-lg dark:bg-purple-900/20">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Next Steps</h4>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
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

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">Tips for Best Results</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Use clear, well-lit images</li>
                <li>Focus on affected plant parts</li>
                <li>Avoid blurry or dark photos</li>
                <li>Include multiple angles if possible</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
