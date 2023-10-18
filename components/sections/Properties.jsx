import { slideIn } from "@/utils/motion";
import PropertiesCard from "../PropertiesCard";
import { motion } from "framer-motion";

function convertToAMPM(timestamp) {
  // Create a new Date object using the timestamp in milliseconds
  var date = new Date(timestamp * 1000);

  // Extract hours, minutes, and AM/PM indicator
  var hours = date.getHours() % 12;
  var minutes = "0" + date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";

  // Format the time in AM/PM format
  var formattedTime = hours + ":" + minutes.slice(-2) + " " + ampm;

  return formattedTime;
}

const Properties = ({
  sunrise,
  sunset,
  wind,
  humidity,
  feelsLike,
  visibility,
}) => {
  return (
    <motion.div className=" grid sm:grid-cols-2 grid-cols-1 gap-y-3 gap-x-10 py-6 sm:w-1/2 w-full" variants={slideIn('left', 'tween', 0.2, 1)} >
      <PropertiesCard
        title="Sunrise"
        imgSrc="../Properties/sunrise.svg"
        value={`${convertToAMPM(sunrise)}`}
      />
      <PropertiesCard
        title="Sunset"
        imgSrc="../Properties/sunset.svg"
        value={`${convertToAMPM(sunset)}`}
      />
      <PropertiesCard
        title="Wind"
        imgSrc="../Properties/wind.svg"
        value={`${wind} km/h`}
      />
      <PropertiesCard
        title="Humidity"
        imgSrc="../Properties/humidity.svg"
        value={`${humidity} %`}
      />
      <PropertiesCard
        title="Feels Like"
        imgSrc="../Properties/feels.svg"
        value={`${feelsLike} °C`}
      />
      <PropertiesCard
        title="Visibility"
        imgSrc="../Properties/visibility.svg"
        value={`${visibility} km`}
      />
    </motion.div>
  );
};

export default Properties;
