import { motion } from "framer-motion";
import ForecastCard from "../ForecastCard";
import { slideIn } from "@/utils/motion";

const Forecast = ({data}) => {
  

  return (
    <motion.div className="flex flex-col gap-3 p-6 sm:w-3/4 w-full" variants={slideIn('right', 'tween', 0.2, 1)}>
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
