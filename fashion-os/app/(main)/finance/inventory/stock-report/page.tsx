import { Metadata } from 'next'
import StockReport from './StockReport'

export const metadata: Metadata = {
  title: 'Raw Material Stock Report',
  description: 'Raw Material Stock Report',
}

const page = () => {
    return (
        <StockReport />
    )
}

export default page