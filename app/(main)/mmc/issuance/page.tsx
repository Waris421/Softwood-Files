import { Metadata } from 'next';
import Issuances from './Issuances';

export const metadata: Metadata = {
  title: 'Issuances',
  description: 'Issuance list',
}

const page = () => {
    return <Issuances />
}

export default page
