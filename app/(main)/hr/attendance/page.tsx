import { Metadata } from 'next'
import Attendance from './Attendance'

export const metadata: Metadata = {
  title: 'Attendance record',
  description: 'Attendance record',
}

const page = () => {
    return (
        <Attendance />
    )
}

export default page