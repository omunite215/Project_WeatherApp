import { ForecastResponse } from "@/types";
import ForecastCard from "../ForecastCard";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const Forecast = ({ data }: { data: ForecastResponse | null }) => {
  return (
    data && (
      <div className="flex flex-col gap-2">
        <h1 className=" text-3xl font-bold">5 Days Forecast</h1>
        <ScrollArea className="h-72 2xl:w-[40rem] xl:w-[35rem] lg:w-[25rem] md:w-[20rem] rounded-md border">
          <div className="p-4">
            {data.list.map((item) => (
              <>
                <ForecastCard
                  temperature={item.main.temp}
                  summary={item.weather[0].main}
                  dateAndTime={item.dt_txt}
                  key={item.main.temp}
                />
                <Separator className=" my-2" />
              </>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  );
};

export default Forecast;
