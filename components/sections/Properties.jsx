import React from 'react'
import PropertiesCard from '../PropertiesCard'

function convertToAMPM(timestamp) {
  // Create a new Date object using the timestamp in milliseconds
  var date = new Date(timestamp * 1000);
  
  // Extract hours, minutes, and AM/PM indicator
  var hours = date.getHours() % 12;
  var minutes = "0" + date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Format the time in AM/PM format
  var formattedTime = hours + ':' + minutes.slice(-2) + ' ' + ampm;
  
  return formattedTime;
}

const Properties = ({sunrise, sunset, wind, humidity, feelsLike, visibility}) => {

  let PropertiesProps = [
    {
      imgSrc: "../Properties/sunrise.svg",
      title: "Sunrise",
      value: `${convertToAMPM(sunrise)}`
    },
    {
      imgSrc: "../Properties/sunset.svg",
      title: "Sunset",
      value: `${convertToAMPM(sunset)}`
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
      value: `${feelsLike} °C`
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