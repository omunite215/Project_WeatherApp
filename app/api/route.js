import axios from "axios";
require("dotenv").config();
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;


export async function AllWeatherData (searchLocation) {
  let locationTerm = searchLocation.toLowerCase();
  const weather_URL = "https://api.openweathermap.org/data/2.5/weather?";
  const forecast_URL = "https://api.openweathermap.org/data/2.5/forecast?";
  try {
    const params = {
        q: locationTerm,
        appid: API_KEY,
        units: 'metric'
    };
    const weatherResponse = await axios.get(weather_URL, { params });
    const forecastResponse = await axios.get(forecast_URL, { params });
    return {
      weatherData: weatherResponse.data,
      forecastData: forecastResponse.data,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};
