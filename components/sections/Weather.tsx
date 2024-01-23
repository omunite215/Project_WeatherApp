import { WeatherResponse } from "@/types";
import { formatTime } from "@/utils";
import WeatherCard from "../WeatherCard";

const Weather = ({ data }: { data: WeatherResponse | null }) => {
  if (data) {
    const weatherCardArray = [
      {
        title: "Sunrise",
        imgSrc: "/weather/sunrise.svg",
        value: `${formatTime(data?.sys?.sunrise)}`,
      },
      {
        title: "Sunset",
        imgSrc: "/weather/sunset.svg",
        value: `${formatTime(data?.sys?.sunset)}`,
      },
      {
        title: "Wind",
        imgSrc: "/weather/wind.svg",
        value: `${data?.wind?.speed} km/h`,
      },
      {
        title: "Humidity",
        imgSrc: "/weather/humidity.svg",
        value: `${data?.main?.humidity} %`,
      },
      {
        title: "Feels Like",
        imgSrc: "/weather/feels.svg",
        value: `${data?.main?.feels_like} °C`,
      },
      {
        title: "Visibility",
        imgSrc: "/weather/visibility.svg",
        value: `${data.visibility} km`,
      },
    ];
    return (
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-3">
        {data &&
          weatherCardArray.map((card) => (
            <WeatherCard
              title={card.title}
              imgSrc={card.imgSrc}
              value={card.value}
              key={card.title}
            />
          ))}
      </div>
    );
  } else {
    return <div>Could not found data</div>;
  }
};

export default Weather;
