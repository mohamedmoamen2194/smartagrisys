import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Microscope, AlertTriangle, CheckCircle, Camera, ImageIcon } from "lucide-react"
import { DiseaseImageUploader } from "@/components/disease-image-uploader"

export default function DiseaseDetectionPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Disease Detection</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Upload or capture plant images for AI-powered disease analysis
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Microscope className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

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
                  <DiseaseImageUploader />
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
              <div className="text-center py-8 sm:py-12">
                <Microscope className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Upload an image to start disease analysis
                </p>
              </div>
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
