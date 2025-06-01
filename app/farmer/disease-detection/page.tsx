"use client"

import { useReports } from "@/hooks/useReports"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Microscope, AlertTriangle, CheckCircle, Camera, ImageIcon, Download } from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"

export default function DiseaseDetectionPage() {
  const { downloadReport } = useReports()

  const handleDownloadReport = () => {
    const reportData = {
      plantType: "Tomato",
      disease: "Late Blight",
      confidence: 0.98,
      affectedArea: 45,
      severity: "High",
      spreadRisk: "High",
    }
    downloadReport("disease-detection", reportData)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Disease Detection</h1>
        <Button>View History</Button>
      </div>

      <Alert variant="destructive" className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Disease Detected</AlertTitle>
        <AlertDescription>
          Late Blight detected in Tomato plants (Section B). Immediate action recommended.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="upload" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="camera">Use Camera</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Plant Image</CardTitle>
              <CardDescription>Upload an image of your plants for disease detection</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="camera" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capture Image</CardTitle>
              <CardDescription>Use your camera to take a picture of your plants</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="h-24 w-24 text-muted-foreground" />
              </div>
              <Button>
                <Camera className="mr-2 h-4 w-4" /> Capture Image
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Latest disease detection analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Microscope className="h-24 w-24 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plant Type</p>
                  <p className="font-medium">Tomato</p>
                </div>
                <Badge variant="destructive">Disease Detected</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Diagnosis</h3>
                  <span className="text-destructive font-medium">Late Blight</span>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Confidence</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Affected Area</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Severity</span>
                    <span className="font-medium text-destructive">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Spread Risk</span>
                    <span className="font-medium text-destructive">High</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Recommended Action</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                    <span>Remove and destroy infected plants immediately</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5" />
                    <span>Apply fungicide to remaining plants</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                    <span>Improve air circulation around plants</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                    <span>Water at the base of plants, avoid wetting foliage</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button variant="destructive">Mark for Treatment</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
