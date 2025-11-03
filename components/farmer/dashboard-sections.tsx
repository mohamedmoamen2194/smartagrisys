"use client"

import { ReactNode, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Leaf, AlertCircle, TrendingUp, BarChart3, Activity } from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { RecentOrders } from "@/components/recent-orders"
import { FarmVisualization } from "@/components/farm/farm-visualization"

export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  inventoryItems: number;
  lowStockItems: number;
}

type FarmerDashboardSectionsProps = {
  stats: DashboardStats
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  locale?: "en" | "ar"
}

export function FarmerDashboardSections({ stats, loading, error, onRefresh, locale = "en" }: FarmerDashboardSectionsProps) {
  const t = useMemo(() => {
    const en = {
      farms: "My Farms",
      insights: "Insights",
      summary: "My Summary",
      lastUpdated: "Last updated",
      refresh: "Refresh",
      attentionNeeded: "Attention needed",
      lowStockMsg: (n: number) => `${n} products are running low on stock. Check Inventory for details.`,
      totalRevenue: "Total Revenue",
      fromOrders: (n: number) => `From ${n} orders`,
      inventoryItems: "Inventory Items",
      lowInStock: (n: number) => `${n} products low in stock`,
      pendingOrders: "Pending Orders",
      inTransitOrders: (n: number) => `${n} orders in transit`,
      deliveredOrders: "Delivered Orders",
      deliveredDesc: "Successfully completed",
      revenueOverview: "Revenue Overview",
      revenueOverviewDesc: "Monthly revenue and expenses",
      recentOrders: "Recent Orders",
      recentOrdersDesc: "Latest customer orders requiring attention",
      cropInsights: "Crop Health & Resource Insights",
      cropInsightsDesc: "AI highlights based on recent activity",
      waterUsage: "Water Usage",
      waterUsageDesc: "Irrigation usage slightly above weekly average. Consider night irrigation.",
      soilNutrients: "Soil Nutrients",
      soilNutrientsDesc: "Nitrogen trending low for field A. Plan supplementation.",
      pestRisk: "Pest Risk",
      pestRiskDesc: "Moderate risk detected for aphids in tomatoes. Monitor closely.",
    }
    const ar = {
      farms: "مزارعي",
      insights: "الرؤى",
      summary: "ملخصي",
      lastUpdated: "آخر تحديث",
      refresh: "تحديث",
      attentionNeeded: "يتطلب الانتباه",
      lowStockMsg: (n: number) => `هناك ${n} منتجات منخفضة المخزون. تحقق من المخزون للتفاصيل.`,
      totalRevenue: "إجمالي الإيرادات",
      fromOrders: (n: number) => `من ${n} طلبًا`,
      inventoryItems: "عناصر المخزون",
      lowInStock: (n: number) => `${n} عناصر منخفضة المخزون`,
      pendingOrders: "طلبات قيد الانتظار",
      inTransitOrders: (n: number) => `${n} طلبًا قيد الشحن`,
      deliveredOrders: "طلبات تم تسليمها",
      deliveredDesc: "اكتملت بنجاح",
      revenueOverview: "نظرة عامة على الإيرادات",
      revenueOverviewDesc: "الإيرادات والمصروفات الشهرية",
      recentOrders: "الطلبات الحديثة",
      recentOrdersDesc: "أحدث طلبات العملاء التي تتطلب الانتباه",
      cropInsights: "رؤى صحة المحاصيل والموارد",
      cropInsightsDesc: "أبرز مخرجات الذكاء الاصطناعي بناءً على النشاط الأخير",
      waterUsage: "استهلاك المياه",
      waterUsageDesc: "استخدام الري أعلى قليلًا من المتوسط الأسبوعي. فكر في الري الليلي.",
      soilNutrients: "مغذيات التربة",
      soilNutrientsDesc: "انخفاض في النيتروجين للحقل أ. خطط للتسميد.",
      pestRisk: "مخاطر الآفات",
      pestRiskDesc: "تم رصد خطر متوسط لحشرات المن في الطماطم. راقب عن كثب.",
    }
    return locale === "ar" ? ar : en
  }, [locale])

  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <div dir={dir} className="mt-2">
      <div className="flex flex-col items-start gap-2">
        <Badge variant="outline" className="text-sm">
          {t.lastUpdated}: {new Date().toLocaleTimeString()}
        </Badge>
        <Button size="sm" onClick={onRefresh}>{t.refresh}</Button>
      </div>

      {error && (
        <Alert className="mt-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t.attentionNeeded}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats.lowStockItems > 0 && (
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t.attentionNeeded}</AlertTitle>
          <AlertDescription>
            {t.lowStockMsg(stats.lowStockItems)}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="farms" className="mt-6">
        <TabsList>
          <TabsTrigger value="farms">{t.farms}</TabsTrigger>
          <TabsTrigger value="insights">{t.insights}</TabsTrigger>
          <TabsTrigger value="summary">{t.summary}</TabsTrigger>
        </TabsList>

        <TabsContent value="farms" className="mt-6">
          <FarmVisualization />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t.cropInsights}</CardTitle>
                <CardDescription>{t.cropInsightsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Leaf className="h-4 w-4 mt-0.5" />
                    <div>
                      <div className="font-medium">{t.waterUsage}</div>
                      <div>{t.waterUsageDesc}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-4 w-4 mt-0.5" />
                    <div>
                      <div className="font-medium">{t.soilNutrients}</div>
                      <div>{t.soilNutrientsDesc}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="h-4 w-4 mt-0.5" />
                    <div>
                      <div className="font-medium">{t.pestRisk}</div>
                      <div>{t.pestRiskDesc}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Number(stats.totalRevenue).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{t.fromOrders(stats.totalOrders)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.inventoryItems}</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inventoryItems}</div>
                <p className="text-xs text-muted-foreground">{t.lowInStock(stats.lowStockItems)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.pendingOrders}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">{t.inTransitOrders(stats.inTransitOrders)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.deliveredOrders}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
                <p className="text-xs text-muted-foreground">{t.deliveredDesc}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t.revenueOverview}</CardTitle>
                <CardDescription>{t.revenueOverviewDesc}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <DashboardChart />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>{t.recentOrders}</CardTitle>
                <CardDescription>{t.recentOrdersDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


