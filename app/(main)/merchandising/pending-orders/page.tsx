import { Metadata } from 'next'
import Parent from './Parent'

export const metadata: Metadata = {
  title: 'Unordered Inventories',
  description: 'Unordered Inventories Report',
}

const page = () => {
    return (
        <Parent />
    )
}

export default page