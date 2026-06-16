import { Metadata } from 'next'
import ExportData from './ExportData'

export const metadata: Metadata = {
  title: 'Customer Master List',
  description: 'Customer Master List',
}

const page = () => {
    return (
        <ExportData />
    )
}

export default page