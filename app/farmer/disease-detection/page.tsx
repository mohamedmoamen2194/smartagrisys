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
import { useTranslations } from "@/hooks/useTranslations"

export default function DiseaseDetectionPage() {
  const { t } = useTranslations()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-6">
      <FarmerPageHeader
        title={t("diseaseDetection.title")}
        subtitle={t("diseaseDetection.subtitle")}
        actions={<Badge variant="secondary" className="w-fit"><Microscope className="h-3 w-3 mr-1" />AI Powered</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div className="space-y-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upload" className="text-xs sm:text-sm">
                <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t("diseaseDetection.uploadImage")}</span>
                <span className="sm:hidden">{t("diseaseDetection.upload")}</span>
              </TabsTrigger>
              <TabsTrigger value="camera" className="text-xs sm:text-sm">
                <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t("diseaseDetection.useCamera")}</span>
                <span className="sm:hidden">{t("diseaseDetection.camera")}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">{t("diseaseDetection.uploadPlantImage")}</CardTitle>
                  <CardDescription className="text-sm">
                    {t("diseaseDetection.uploadDescription")}
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
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">{t("diseaseDetection.treatmentRecommendations")}</h4>
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
              <Card className="shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">{t("diseaseDetection.captureImage")}</CardTitle>
                  <CardDescription className="text-sm">
                    {t("diseaseDetection.captureDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <ImageIcon className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-muted-foreground" />
                  </div>
                  <Button className="w-full sm:w-auto">
                    <Camera className="mr-2 h-4 w-4" /> 
                    <span className="hidden sm:inline">{t("diseaseDetection.captureImage")}</span>
                    <span className="sm:hidden">{t("diseaseDetection.camera")}</span>
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
                {t("diseaseDetection.analysisResults")}
              </CardTitle>
              <CardDescription className="text-sm">
                {t("diseaseDetection.resultsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 sm:py-12">
                  <Microscope className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {t("diseaseDetection.analyzing")}
                  </p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="text-center p-6 rounded-lg bg-green-900/10 dark:bg-green-50">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-700 mb-2">
                      {result.disease}
                    </div>
                    <div className="text-green-800/80 dark:text-green-800/80 mb-2">
                      {t("diseaseDetection.confidence")}: {(result.confidence * 100).toFixed(1)}%
                    </div>
                    {result.source && (
                      <div className="text-xs text-muted-foreground">
                        {t("diseaseDetection.source")}: {result.source === 'local_pipeline' ? t("diseaseDetection.aiModel") : result.source === 'fallback' ? t("diseaseDetection.fallback") : 'Local Pipeline'}
                      </div>
                    )}
                  </div>
                  
                  {result.reasoning && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">{t("diseaseDetection.analysisDetails")}</h4>
                      <p className="text-sm text-green-800/90 dark:text-green-800/90">{result.reasoning}</p>
                    </div>
                  )}
                  
                  {result.severity && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">{t("diseaseDetection.severity")}: {result.severity.toUpperCase()}</h4>
                    </div>
                  )}
                  
                  {result.treatment && result.treatment.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">{t("diseaseDetection.treatmentRecommendations")}</h4>
                      <ul className="text-sm text-green-800/90 dark:text-green-800/90 space-y-1">
                        {result.treatment.map((treatment: string, index: number) => (
                          <li key={index}>• {treatment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.symptoms && result.symptoms.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">{t("diseaseDetection.symptoms")}</h4>
                      <ul className="text-sm text-green-800/90 dark:text-green-800/90 space-y-1">
                        {result.symptoms.map((symptom: string, index: number) => (
                          <li key={index}>• {symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.nextSteps && result.nextSteps.length > 0 && (
                    <div className="p-4 rounded-lg bg-green-900/10 dark:bg-green-50">
                      <h4 className="font-semibold text-green-800 dark:text-green-800 mb-2">{t("diseaseDetection.nextSteps")}</h4>
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
                    {t("diseaseDetection.uploadToStart")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">{t("diseaseDetection.tipsForBestResults")}</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>{t("diseaseDetection.tip1")}</li>
                <li>{t("diseaseDetection.tip2")}</li>
                <li>{t("diseaseDetection.tip3")}</li>
                <li>{t("diseaseDetection.tip4")}</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
