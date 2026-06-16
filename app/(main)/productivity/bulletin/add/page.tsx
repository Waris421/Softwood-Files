import { Metadata } from 'next';
import ProcessFlow from './FlowChart';

export const metadata: Metadata = {
  title: 'Creating Style Bulletin',
  description: 'Creating Style Bulletin',
}

const page = () => {
    return (
        <ProcessFlow />
    )
}

export default page;