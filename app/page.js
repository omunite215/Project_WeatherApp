"use client";
import { motion } from "framer-motion";
require('dotenv').config();
import axios from "axios";
import Image from "next/image";
import { ModeToggle } from "@/components/ThemeSwitch";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Hero, Properties, Forecast } from "@/components/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { navVariants } from "@/utils/motion";

export default function Home() {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const fetchWeatherData = async (searchLocation) => {
    setLoading(true);
    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather?q=` +
      searchLocation +
      `&appid=` +
      API_KEY +
      `&units=metric`;
    try {
      const response = await axios.get(weatherUrl);
      setLoading(false);
      setWeatherData(response.data);
    } catch (error) {
      console.log(`Error fetching Weather: `, error);
      setLoading(false);
    }
  };

  const fetchForecastData = async (searchLocation) => {
    const forecastUrl =
      `https://api.openweathermap.org/data/2.5/forecast?q=` +
      searchLocation +
      `&appid=` +
      API_KEY +
      `&units=metric`;
    try {
      const response = await axios.get(forecastUrl);
      setForecastData(response.data);
    } catch (error) {
      console.log(`Error fetching Weather: `, error);
    }
  };

  const handleSearch = () => {
    fetchWeatherData(location);
    fetchForecastData(location);
  };

  useEffect(() => {
    fetchWeatherData("London");
    fetchForecastData("London");
  }, []);

  return (
    <main className=" font-poppins w-full overflow-hidden">
      {/* Navbar */}
      <header className="padding-x flex-Center">
        <motion.nav className="boxWidth" variants={navVariants} initial="hidden" whileInView="show">
          <section className="w-full flex-Between py-6">
            <div className="flex-Start sm:gap-3 sm:flex-row flex-col">
              <Image src="../logo.svg" width={72} height={72} alt="logo-icon" />
              <ModeToggle />
            </div>
            <div action="" className="flex-End gap-3 sm:flex-row flex-col">
              <Input
                type="text"
                placeholder="Search Location..."
                className="md:w-[100px] lg:w-[300px]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </section>
        </motion.nav>
      </header>
      {/* Hero */}
      <section className="flex justify-center items-start">
        <section className="boxWidth">
        {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <Hero
              temp={weatherData?.main.temp}
              temp_description={weatherData?.weather[0].main}
              location={`${weatherData?.name}, ${weatherData?.sys.country}`}
              dt={weatherData?.dt}
              timezone={weatherData?.timezone}
            />
          )}
        </section>
      </section>
      {/* Properties and Forecast */}
      <section className="padding-x flex justify-center items-start">
        <section className="boxWidth">
        <div className="flex-Between md:flex-row flex-col w-full">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <Properties
              sunrise={weatherData?.sys.sunrise}
              sunset={weatherData?.sys.sunset}
              wind={weatherData?.wind.speed}
              humidity={weatherData?.main.humidity}
              feelsLike={weatherData?.main.feels_like}
              visibility={weatherData?.visibility}
            />
          )}
          {loading ? <Skeleton className="h-full w-full" /> : <Forecast data={forecastData} />}
        </div>
        </section>
      </section>
    </main>
  );
}
