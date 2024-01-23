"use client";
import { ContextProps, ForecastResponse, WeatherResponse } from "@/types";
import { createContext, useContext, useState } from "react";

const defaultValues = {
  search: "",
  setSearch: () => {},
  weather: null,
  setWeather: () => {},
  forecast: null,
  setForecast: () => {},
};

const LocationContext = createContext<ContextProps>(defaultValues);

export const LocationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  return (
    <LocationContext.Provider
      value={{
        search: search,
        setSearch: setSearch,
        weather: weather,
        setWeather: setWeather,
        forecast: forecast,
        setForecast: setForecast,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
