"use client";
import Forecast from "@/components/sections/Forecast";
import Hero from "@/components/sections/Hero";
import Weather from "@/components/sections/Weather";
import { useLocationContext } from "@/context/ContextProvider";
import {
  getForecastByLocationService,
  getWeatherByLocationService,
} from "@/services";
import { useEffect } from "react";

export default function Home() {
  const { weather, setWeather, forecast, setForecast } = useLocationContext();

  useEffect(() => {
    const firstFunction = async () => {
      const weather = await getWeatherByLocationService("london");
      setWeather(weather);
      const forecast = await getForecastByLocationService("london");
      setForecast(forecast);
    };
    firstFunction();
  }, []);

  return (
    <>
      <Hero data={weather} />
      <section className="flexBetween lg:flex-row flex-col py-4 padding-x gap-y-6">
        <Weather data={weather} />
        <Forecast data={forecast} />
      </section>
    </>
  );
}
