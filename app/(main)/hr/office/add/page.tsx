import { Metadata } from 'next'
import OfficeForm from './Form'

export const metadata: Metadata = {
  title: 'Office Addition',
  description: 'Office Addition',
}

const page = () => {
    return (
        <OfficeForm />
    )
}

export default page