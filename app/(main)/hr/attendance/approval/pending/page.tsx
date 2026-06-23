import { Metadata } from 'next'
import Approvals from './Approvals';

export const metadata: Metadata = {
  title: 'Pending Approvals',
  description: 'Pending Attendance Approvals',
}

const page = () => {
    return (
        <Approvals />
    )
}

export default page;