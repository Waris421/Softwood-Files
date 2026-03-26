import { Metadata } from 'next'
import OfficeList from './Offices';

export const metadata: Metadata = {
  title: 'Office List',
  description: 'Office List',
}

const page = () => {
    return (
        <OfficeList />
    )
}

export default page;