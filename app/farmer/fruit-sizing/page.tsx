"use client"

import { useReports } from "@/hooks/useReports"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Ruler, ImageIcon, Check, Download } from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"

export default function FruitSizingPage() {
  const { downloadReport } = useReports()

  const handleDownloadReport = () => {
    const reportData = {
      date: "June 1, 2025",
      time: "14:36:47",
      grade: "A",
      avgDiameter: 8,
      avgWeight: 150,
      colorUniformity: 95,
      defects: "None",
      harvestReady: true,
    }
    downloadReport("fruit-sizing", reportData)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fruit Sizing</h1>
        <Button>View History</Button>
      </div>

      <Tabs defaultValue="upload" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="camera">Use Camera</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Fruit Image</CardTitle>
              <CardDescription>Upload an image of your fruits for size analysis</CardDescription>
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
              <CardDescription>Use your camera to take a picture of your fruits</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="h-24 w-24 text-muted-foreground" />
              </div>
              <Button>
                <ImageIcon className="mr-2 h-4 w-4" /> Capture Image
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Latest fruit sizing analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Ruler className="h-24 w-24 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <p className="text-sm">June 1, 2025</p>
                </div>
                <div className="space-y-1">
                  <Label>Time</Label>
                  <p className="text-sm">14:36:47</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Size Classification</h3>
                  <span className="text-lg font-bold text-green-600">Grade A</span>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Diameter</span>
                    <span className="font-medium">8cm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weight (estimated)</span>
                    <span className="font-medium">150g</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Color Uniformity</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Surface Defects</span>
                    <span className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" /> None
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Harvest Ready</span>
                    <span className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-1" /> Yes
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Recommendation</h3>
                <p className="text-sm text-muted-foreground">
                  Fruits are ready for harvest. Grade A classification makes them suitable for premium markets. Harvest
                  within 2-3 days for optimal quality.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button>Add to Inventory</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
