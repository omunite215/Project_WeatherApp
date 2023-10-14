

function splitStringAtFirstSpace(string) {
  const firstSpaceIndex = string.indexOf(' ');
  if (firstSpaceIndex === -1) {
    return [string, ''];
  } else {
    return [string.slice(0, firstSpaceIndex), string.slice(firstSpaceIndex + 1)];
  }
}



const ForecastCard = ({ summary, temperature, dateAndTime }) => {
  const [firstHalf, secondHalf] = splitStringAtFirstSpace(dateAndTime);
  return (
    <div className='w-full flex-Between flex-wrap p-5 border rounded-xl shadow-lg'>
        <div className='flex justify-start items-start gap-1'>
            <h1 className='Forecast-Card-Text'>{firstHalf}</h1>
            <h2 className='Forecast-Card-Text'>{secondHalf}</h2>
        </div>
        <div className='flex-Center gap-2'>
        <p className='Forecast-Card-Text'>{temperature}</p>
        </div>
        <h3 className='Forecast-Card-Text'>{summary}</h3>
    </div>
  )
}

export default ForecastCard;