import { Metadata } from 'next'
import HolidayForm from './Form'

export const metadata: Metadata = {
  title: 'Adding Holidays',
  description: 'Adding Holidays',
}

const page = () => {
    return (
        <HolidayForm />
    )
}

export default page