import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Ruler, ImageIcon, Check } from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"

export default function FruitSizingPage() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4 w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">Fruit Sizing</h1>
      </div>

      <Tabs defaultValue="upload" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="camera">Use Camera</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="space-y-4">
          <Card className="shadow rounded-lg overflow-hidden">
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
          <Card className="shadow rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle>Capture Image</CardTitle>
              <CardDescription>Use your camera to take a picture of your fruits</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="h-24 w-24 text-muted-foreground" />
              </div>
              <Button className="w-full sm:w-auto">
                <ImageIcon className="mr-2 h-4 w-4" /> Capture Image
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
