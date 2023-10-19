"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ModeToggle } from "@/components/ThemeSwitch";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Hero, Properties, Forecast } from "@/components/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { navVariants } from "@/utils/motion";
import { AllWeatherData } from "./api/route";

export default function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");

  const handleSearch = async () => {
    const response = await AllWeatherData(location);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setWeatherData(response.weatherData);
      setForecastData(response.forecastData);
    }, 2000);
  };

  useEffect(() => {
    const firstFunction = async () => {
      const response = await AllWeatherData("London");
      setTimeout(() => {
        setLoading(false);
        setWeatherData(response.weatherData);
        setForecastData(response.forecastData);
      }, 3000);
    };
    firstFunction();
  }, []);

  return (
    <main className=" font-poppins w-full overflow-hidden">
      {/* Navbar */}
      <header className="padding-x flex-Center">
        <motion.nav
          className="boxWidth"
          variants={navVariants}
          initial="hidden"
          whileInView="show"
        >
          <section className="w-full flex-Between py-6">
            <div className="flex-Start sm:gap-3 gap-1">
              <Image src="../logo.svg" width={72} height={72} alt="logo-icon" />
              <ModeToggle />
            </div>
            <div action="" className="flex-End sm:gap-3 gap-2">
              <Input
                type="text"
                placeholder="Search Location..."
                className="sm:w-[100px] lg:w-[300px] w-[80px]"
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
            <Skeleton className="xl:w-[1280px] lg:w-[1024px] md:w-[768px] sm:w-[640px] w-auto sm:h-[500px] h-[250px] m-3" />
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
              <Skeleton className="xl:w-[1280px] lg:w-[1024px] md:w-[768px] sm:w-[640px] w-auto sm:h-[500px] h-[250px] m-5" />
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
            {loading ? (
              <Skeleton className="xl:w-[1280px] lg:w-[1024px] md:w-[768px] sm:w-[640px] w-auto sm:h-[500px] h-[250px] m-5" />
            ) : (
              <Forecast data={forecastData} />
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
