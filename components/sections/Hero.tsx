import { WeatherResponse } from "@/types";
import { findTime } from "@/utils";
import Image from "next/image";

const Hero = ({ data }: { data: WeatherResponse | null }) => {
  let description = "imageNotFound";
  let [day, time] = findTime(0, 0);

  if (data) {
    description = data.weather[0].main.toLowerCase();
    if (description === "haze") {
      description = "smoke";
    }
    else if (description === "mist") {
      description = "fog";
    }
    [day, time] = findTime(data.dt, data.timezone);
  }

  return (
    data && (
      <section className="flex flex-col justify-center mt-3 mb-5 padding-x">
        <div className="relative">
          <Image
            src={`/hero/${description}.webp`}
            width={1000}
            height={1000}
            alt="weather-img"
            priority={true}
            className="w-full h-[50vh] rounded-lg object-cover"
          />
          <div className="absolute bottom-0 p-3 flexBetween w-full sm:gap-0 gap-2">
            <div className="flex flex-col gap-2 hero-Text-Bg relative z-10">
              <h1 className=" sm:text-7xl text-3xl">{data?.main?.temp}°C</h1>
              <h2 className=" sm:text-3xl text-2xl">
                {data?.name}&nbsp;
                <span className="sm:inline-block hidden">
                  , {data?.sys?.country}
                </span>
              </h2>
            </div>
            <div className="flex flex-col gap-2 justify-end mt-auto h-1/2 hero-Text-Bg relative z-10">
              <h3 className="hero-Subtext">{time}</h3>
              <h3 className="hero-Subtext">
                {data?.weather[0]?.main}&nbsp;
                <span className="sm:inline-block hidden">, {day}</span>
              </h3>
            </div>
          </div>
        </div>
      </section>
    )
  );
};

export default Hero;
