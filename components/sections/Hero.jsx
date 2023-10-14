"use client";
import React from "react";
import { useEffect, useState } from "react";


const Hero = ({ temp, location, temp_description, dt, timezone }) => {
  // Calculate local time using the timestamp and timezone offset
  const localTime = new Date((dt + timezone) * 1000); // Convert from UTC to local time
  const [imgString, setImgString] = useState('imageNotFound');

  // Extract day and time separately
  const optionsDay = { weekday: "long" };
  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  };
  let day = localTime.toLocaleDateString(undefined, optionsDay);
  let time = localTime.toLocaleTimeString(undefined, optionsTime);
  const imgSetting = (string) => {
      switch(string){
        case 'Clear':
          setImgString('bg-clear');
          break;
        case 'Clouds':
          setImgString('bg-cloudy');
          break;
        case 'Drizzle':
          setImgString('bg-drizzle');
          break;
        case 'Foggy':
          setImgString('bg-foggy');
          break; 
        case 'Rainy':
          setImgString('bg-rainy'); 
        case 'Sand':
          setImgString('bg-sand');
          break; 
        case 'Smoke':
          setImgString('bg-smoke');
          break;
        case 'Haze':
          setImgString('bg-smoke');
          break;
        case 'Snow':
          setImgString('bg-snow');
          break; 
        case 'Sunny':
          setImgString('bg-sunny');
          break; 
        case 'Squall':
          setImgString('bg-squall');
          break;
        case 'Thunderstorm':
          setImgString('bg-thunderstorm');
          break;
        default:
          setImgString('bg-imageNotFound');      
      }
  }
  useEffect(() => {
    imgSetting(temp_description);
  },[imgString]);
  return (
    <section className={`flex flex-col items-end ${imgString} bg-cover bg-center bg-no-repeat rounded-xl pt-[20%] w-full`}>
      <section className="w-full p-6 flex justify-between md:flex-row flex-col font-semibold">
        <div className="flex flex-col gap-2 hero-Text-Bg">
          <h1 className=" sm:text-7xl text-3xl">{temp} °C</h1>
          <h2 className=" sm:text-3xl text-2xl">{location}</h2>
        </div>
        <div className="flex flex-col gap-2 justify-end mt-auto h-1/2 hero-Text-Bg">
          <h3 className="hero-Subtext">{time}</h3>
          <h3 className="hero-Subtext">{temp_description}, {day}</h3>
        </div>
      </section>
    </section>
  );
};

export default Hero;
