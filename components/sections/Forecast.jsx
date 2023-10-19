import { motion } from "framer-motion";
import ForecastCard from "../ForecastCard";
import { slideIn } from "@/utils/motion";

const Forecast = ({ data }) => {
  return (
    <motion.div
      className="flex flex-col gap-3 p-6 sm:w-3/4 w-full"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className=" heading-Text pl-4">5 Days Forecast</h1>
      <div className="w-full flex flex-col px-6 py-8 gap-2 max-h-[325px] overflow-y-scroll">
        {data?.list.map((item, index) => (
          <ForecastCard
            temperature={item.main.temp}
            summary={item.weather[0].main}
            dateAndTime={item.dt_txt}
            key={index}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Forecast;
