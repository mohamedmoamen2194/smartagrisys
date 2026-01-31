"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Cloud, Droplets, Wind, Gauge, AlertTriangle } from "lucide-react"
import { useTranslations } from "@/hooks/useTranslations"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface WeatherAlert {
  event?: string
  severity?: string
  headline?: string
  effective?: string
  expires?: string
  description?: string
  areas?: string
}

interface HourForecast {
  time: string
  temp: number
  condition?: string
  icon?: string
  chanceOfRain?: number
}

interface ForecastDay {
  date: string
  sunrise?: string
  sunset?: string
  condition?: string
  icon?: string
  maxTemp?: number
  minTemp?: number
  avgHumidity?: number
  chanceOfRain?: number
  hourly: HourForecast[]
}

interface WeatherPayload {
  location: {
    name?: string
    region?: string
    country?: string
    localtime?: string
    tzId?: string
  }
  current: {
    temperature?: number
    feelsLike?: number
    condition?: string
    icon?: string
    humidity?: number
    windKph?: number
    windDir?: string
    gustKph?: number
  }
  forecast: ForecastDay[]
  alerts: WeatherAlert[]
}

export default function WeatherMarketPage() {
  const { t, locale } = useTranslations()
  const [locationInput, setLocationInput] = useState("Cairo")
  const [activeLocation, setActiveLocation] = useState("Cairo")
  const [weather, setWeather] = useState<WeatherPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const formatterLocale = locale === "ar" ? "ar-EG" : "en-EG"

  const temperatureFormatter = useMemo(
    () => new Intl.NumberFormat(formatterLocale, { maximumFractionDigits: 1 }),
    [formatterLocale]
  )

  const dayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(formatterLocale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    [formatterLocale]
  )

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(formatterLocale, {
        hour: "numeric",
        minute: "numeric",
      }),
    [formatterLocale]
  )

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        location: activeLocation,
        lang: locale === "ar" ? "ar" : "en",
        days: "3",
      })

      const response = await fetch(`/api/weather?${params.toString()}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Failed to fetch weather data")
      }

      const payload: WeatherPayload = await response.json()
      setWeather(payload)
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      const message = err instanceof Error ? err.message : t("weatherMarket.error")
      setError(message)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }, [activeLocation, locale, t])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!locationInput.trim()) return
    setActiveLocation(locationInput.trim())
  }

  const hourlyData = useMemo(() => {
    if (!weather?.forecast?.length) return []
    const [firstDay] = weather.forecast
    return firstDay.hourly.map((hour) => ({
      timeLabel: timeFormatter.format(new Date(hour.time)),
      temperature: hour.temp,
      condition: hour.condition,
      chanceOfRain: hour.chanceOfRain,
    }))
  }, [weather, timeFormatter])

  const summaryText = useMemo(() => {
    if (!weather?.forecast?.length) return ""
    const [today] = weather.forecast
    const template = t("weatherMarket.summaryTemplate") || ""

    return template
      .replace("{condition}", today.condition ?? "—")
      .replace("{max}", today.maxTemp != null ? temperatureFormatter.format(today.maxTemp) : "—")
      .replace("{min}", today.minTemp != null ? temperatureFormatter.format(today.minTemp) : "—")
      .replace(
        "{rain}",
        today.chanceOfRain != null ? `${today.chanceOfRain}` : "0"
      )
  }, [t, weather, temperatureFormatter])

  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return null
    return `${t("weatherMarket.lastUpdated")}: ${timeFormatter.format(new Date(lastUpdated))}`
  }, [lastUpdated, timeFormatter, t])

  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Cloud className="h-12 w-12" style={{ color: "hsl(var(--primary))" }} />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                {t("weatherMarket.title")} {" "}
                <span style={{ color: "hsl(var(--primary))" }}>{t("weatherMarket.titleHighlight")}</span>
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
              {t("weatherMarket.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("weatherMarket.searchLabel")}</CardTitle>
              <CardDescription>{weather?.location?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4 sm:flex-row" onSubmit={handleSubmit}>
                <Input
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  placeholder={t("weatherMarket.locationPlaceholder")}
                  className="flex-1"
                />
                <Button type="submit" className="whitespace-nowrap">
                  {t("weatherMarket.searchButton")}
                </Button>
              </form>
              {lastUpdatedText && (
                <p className="mt-3 text-sm text-muted-foreground text-right">{lastUpdatedText}</p>
              )}
            </CardContent>
          </Card>

          {loading && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                {t("weatherMarket.loading")}
              </CardContent>
            </Card>
          )}

          {error && !loading && (
            <Card className="border-destructive/60">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t("weatherMarket.error")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && weather && (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>{t("weatherMarket.currentConditions")}</CardTitle>
                    <CardDescription>
                      {weather.location?.name}, {weather.location?.region} {weather.location?.country ? `• ${weather.location?.country}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        {weather.current.icon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`https:${weather.current.icon}`}
                            alt={weather.current.condition ?? ""}
                            className="h-16 w-16"
                          />
                        )}
                        <div>
                          <div className="text-4xl font-semibold">
                            {weather.current.temperature != null
                              ? `${temperatureFormatter.format(weather.current.temperature)}°`
                              : "—"}
                          </div>
                          <p className="text-muted-foreground">{weather.current.condition}</p>
                        </div>
                      </div>
                    </div>
                    {summaryText && <p className="text-sm text-muted-foreground leading-relaxed">{summaryText}</p>}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <Gauge className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">{t("weatherMarket.feelsLike")}</p>
                          <p className="font-semibold">
                            {weather.current.feelsLike != null
                              ? `${temperatureFormatter.format(weather.current.feelsLike)}°`
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <Droplets className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">{t("weatherMarket.humidity")}</p>
                          <p className="font-semibold">
                            {weather.current.humidity != null ? `${weather.current.humidity}%` : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <Wind className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">{t("weatherMarket.wind")}</p>
                          <p className="font-semibold">
                            {weather.current.windKph != null
                              ? `${temperatureFormatter.format(weather.current.windKph)} ${t("weatherMarket.windUnit")}`
                              : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">{weather.current.windDir}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-4">
                        <Wind className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">{t("weatherMarket.gusts")}</p>
                          <p className="font-semibold">
                            {weather.current.gustKph != null
                              ? `${temperatureFormatter.format(weather.current.gustKph)} ${t("weatherMarket.windUnit")}`
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("weatherMarket.marketInsightsHeading")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>{t("weatherMarket.marketInsightsPlaceholder")}</p>
                    <div className="pt-2 text-xs text-muted-foreground/80">
                      <p>• {t("weatherMarket.realtimeWeatherForecasts")}</p>
                      <p>• {t("weatherMarket.marketDemandAnalysis")}</p>
                      <p>• {t("weatherMarket.priceTrends")}</p>
                      <p>• {t("weatherMarket.seasonalPlanting")}</p>
                      <p>• {t("weatherMarket.weatherAlerts")}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t("weatherMarket.forecastChartTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {hourlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
                        <defs>
                          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                        <XAxis dataKey="timeLabel" tick={{ fontSize: 12 }} interval={hourlyData.length > 12 ? 2 : 0} />
                        <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                        <Tooltip
                          contentStyle={{ fontSize: "12px" }}
                          formatter={(value: number, _name, payload) => {
                            const chance = payload?.payload?.chanceOfRain
                            const condition = payload?.payload?.condition
                            return [
                              `${temperatureFormatter.format(value)}°`,
                              condition ? `${condition}${chance ? ` • ${chance}%` : ""}` : undefined,
                            ].filter(Boolean)
                          }}
                        />
                        <Area type="monotone" dataKey="temperature" stroke="hsl(var(--primary))" fill="url(#tempGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {t("weatherMarket.error")}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-3">
                {weather.forecast.map((day) => (
                  <Card key={day.date} className="border">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {day.date ? dayFormatter.format(new Date(day.date)) : day.date}
                      </CardTitle>
                      <CardDescription>{day.condition}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        {day.icon && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`https:${day.icon}`} alt={day.condition ?? ""} className="h-12 w-12" />
                        )}
                        <div className="flex gap-4 text-base">
                          <span className="font-semibold text-primary">
                            {day.maxTemp != null ? `${temperatureFormatter.format(day.maxTemp)}°` : "—"}
                          </span>
                          <span className="text-muted-foreground">
                            {day.minTemp != null ? `${temperatureFormatter.format(day.minTemp)}°` : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t("weatherMarket.sunrise")}</span>
                        <span>{day.sunrise ?? "—"}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t("weatherMarket.sunset")}</span>
                        <span>{day.sunset ?? "—"}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t("weatherMarket.chanceOfRain")}</span>
                        <span>{day.chanceOfRain != null ? `${day.chanceOfRain}%` : "—"}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{t("weatherMarket.humidity")}</span>
                        <span>{day.avgHumidity != null ? `${day.avgHumidity}%` : "—"}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    {t("weatherMarket.alertsHeading")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {weather.alerts.length === 0 && (
                    <p className="text-muted-foreground">{t("weatherMarket.noAlerts")}</p>
                  )}
                  {weather.alerts.map((alert, index) => (
                    <div key={`${alert.event}-${index}`} className="rounded-lg border bg-muted/20 p-4">
                      <h3 className="text-base font-semibold">{alert.event ?? alert.headline}</h3>
                      <p className="text-xs text-muted-foreground">
                        {alert.effective} – {alert.expires}
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{alert.description}</p>
                      {alert.areas && <p className="mt-2 text-xs text-muted-foreground">{alert.areas}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

