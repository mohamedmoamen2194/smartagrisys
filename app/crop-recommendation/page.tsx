import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CloudRain, Thermometer, Gauge } from "lucide-react"
import { CropRecommendationChat } from "@/components/crop-recommendation-chat"

export default function CropRecommendationPage() {
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
              <form className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                    <Input id="nitrogen" placeholder="e.g., 40" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phosphorus">Phosphorus (P)</Label>
                    <Input id="phosphorus" placeholder="e.g., 50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="potassium">Potassium (K)</Label>
                    <Input id="potassium" placeholder="e.g., 60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ph">pH Level</Label>
                    <Input id="ph" placeholder="e.g., 6.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rainfall">Rainfall (mm)</Label>
                    <Input id="rainfall" placeholder="e.g., 120" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature (°C)</Label>
                    <Input id="temperature" placeholder="e.g., 24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input id="humidity" placeholder="e.g., 65" />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Get Recommendation</Button>
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
