import React from 'react'
import PropertiesCard from '../PropertiesCard'

const Properties = ({sunrise, sunset, wind, humidity, feelsLike, visibility}) => {
  let PropertiesProps = [
    {
      imgSrc: "../Properties/sunrise.svg",
      title: "Sunrise",
      value: sunrise
    },
    {
      imgSrc: "../Properties/sunset.svg",
      title: "Sunset",
      value: sunset
    },
    {
      imgSrc: "../Properties/wind.svg",
      title: "Wind",
      value: `${wind} km/h`
    },
    {
      imgSrc: "../Properties/humidity.svg",
      title: "Humidity",
      value: `${humidity} %`
    },
    {
      imgSrc: "../Properties/feels.svg",
      title: "Feels Like",
      value: feelsLike
    },
    {
      imgSrc: "../Properties/visibility.svg",
      title: "Visibility",
      value: `${visibility} km`
    },
  ]
  return (
    <section className=' grid sm:grid-cols-2 grid-cols-1 gap-y-3 gap-x-10 py-6 sm:w-1/2 w-full'>
      { PropertiesProps.map((item) => (
        <PropertiesCard imgSrc={item.imgSrc} title={item.title} value={item.value} key={item.title}/>
      ))}

    </section>
  )
}

export default Properties;