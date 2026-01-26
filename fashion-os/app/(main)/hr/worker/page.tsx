import { Metadata } from 'next'
import WorkerList from './Workers'

export const metadata: Metadata = {
  title: 'Employee List',
  description: 'Workers List',
}

const page = () => {
    return (
        <WorkerList />
    )
}

export default page