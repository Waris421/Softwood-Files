import { Metadata } from 'next'
import UploadCSV from './UploadCSV'

// Sets the browser tab title when someone is on this page.
export const metadata: Metadata = {
  title: 'Energy Consumption Upload',
  description: 'Upload energy consumption CSV data',
}

// It just renders the UploadCSV component
const page = () => {
  return <UploadCSV />
}
export default page // Makes this page available to Next.js so it knows what to show at /productivity/energy/upload.