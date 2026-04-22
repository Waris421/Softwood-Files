import { Metadata } from 'next'
import WorkerAddForm from './Form'

export const metadata: Metadata = {
  title: 'Employee Addition',
  description: 'Employee Addition',
}

const page = () => {
    return (
        <WorkerAddForm />
    )
}

export default page