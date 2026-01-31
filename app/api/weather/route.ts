import { NextRequest, NextResponse } from "next/server";

const WEATHER_FORECAST_ENDPOINT = "https://api.weatherapi.com/v1/forecast.json";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const apiKey = process.env.WEATHERAPI_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Weather API key is not configured.",
        details: "Set the WEATHERAPI_KEY environment variable to use the weather forecast service.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const url = new URL(request.url);
  const location = url.searchParams.get("location") || "Cairo";
  const lang = url.searchParams.get("lang") || "en";
  const days = url.searchParams.get("days") || "3";

  const apiUrl = new URL(WEATHER_FORECAST_ENDPOINT);
  apiUrl.searchParams.set("key", apiKey);
  apiUrl.searchParams.set("q", location);
  apiUrl.searchParams.set("days", days);
  apiUrl.searchParams.set("aqi", "no");
  apiUrl.searchParams.set("alerts", "yes");
  apiUrl.searchParams.set("lang", lang);

  try {
    const weatherResponse = await fetch(apiUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error("WeatherAPI error", weatherResponse.status, errorText);

      return NextResponse.json(
        {
          error: "Failed to fetch forecast from WeatherAPI.",
          details: errorText,
        },
        {
          status: weatherResponse.status,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const payload = await weatherResponse.json();

    const responseBody = {
      location: {
        name: payload.location?.name,
        region: payload.location?.region,
        country: payload.location?.country,
        localtime: payload.location?.localtime,
        tzId: payload.location?.tz_id,
      },
      current: {
        temperature: payload.current?.temp_c,
        feelsLike: payload.current?.feelslike_c,
        condition: payload.current?.condition?.text,
        icon: payload.current?.condition?.icon,
        humidity: payload.current?.humidity,
        windKph: payload.current?.wind_kph,
        windDir: payload.current?.wind_dir,
        gustKph: payload.current?.gust_kph,
      },
      forecast: Array.isArray(payload.forecast?.forecastday)
        ? payload.forecast.forecastday.map((day: any) => ({
            date: day.date,
            sunrise: day.astro?.sunrise,
            sunset: day.astro?.sunset,
            condition: day.day?.condition?.text,
            icon: day.day?.condition?.icon,
            maxTemp: day.day?.maxtemp_c,
            minTemp: day.day?.mintemp_c,
            avgHumidity: day.day?.avghumidity,
            chanceOfRain: day.day?.daily_chance_of_rain,
            hourly: Array.isArray(day.hour)
              ? day.hour.map((hour: any) => ({
                  time: hour.time,
                  temp: hour.temp_c,
                  condition: hour.condition?.text,
                  icon: hour.condition?.icon,
                  chanceOfRain: hour.chance_of_rain,
                }))
              : [],
          }))
        : [],
      alerts: Array.isArray(payload.alerts?.alert)
        ? payload.alerts.alert.map((alert: any) => ({
            event: alert.event,
            severity: alert.severity,
            headline: alert.headline,
            effective: alert.effective,
            expires: alert.expires,
            description: alert.desc,
            areas: alert.areas,
          }))
        : [],
    };

    return NextResponse.json(responseBody, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to reach WeatherAPI", error);
    return NextResponse.json(
      {
        error: "Unable to reach the weather service.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
