import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeatherCardProps } from "@/types";
import Image from "next/image";

const WeatherCard = ({ imgSrc, title, value }: WeatherCardProps) => {
  return (
    <Card className="flex px-3">
      <Image src={imgSrc} width={48} height={48} alt={`${title}-icon`} />
      <CardHeader className="flex justify-end">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{value}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default WeatherCard;
