import { Metadata } from 'next'
import CorrectionForm from './Form';

export const metadata: Metadata = {
  title: 'Attendance Correction',
  description: 'Attendance Correction',
}

const page = () => {
    return (
        <CorrectionForm />
    )
}

export default page;