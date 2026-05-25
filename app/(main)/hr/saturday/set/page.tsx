import { Metadata } from 'next'
import SaturdayForm from './Form'

export const metadata: Metadata = {
  title: 'Managing Saturdays',
  description: 'Managing Saturdays',
}

const page = () => {
    return (
        <SaturdayForm />
    )
}

export default page