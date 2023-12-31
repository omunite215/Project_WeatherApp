import Image from 'next/image'

const PropertiesCard = ({imgSrc, title, value}) => {
  return (
    <div className='flex-Start gap-3 px-6 py-6 shadow-xl rounded-xl w-full dark:border dark:border-gray-100'>
      <Image src={imgSrc} width={48} height={48} alt={title} />
      <div className='flex justify-center items-start flex-col'>
        <h3 className=' sm:text-3xl text-2xl font-normal'>{title}</h3>
        <h3 className='properties-Card-Text font-semibold'>{value}</h3>
      </div>
    </div>
  )
}

export default PropertiesCard;