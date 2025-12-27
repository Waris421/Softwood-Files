import { Metadata } from 'next'
import DropDown from "@/_components/Dropdown/Dropdown"

export const metadata: Metadata = {
  title: 'Production Management',
  description: 'Production Management',
}

const page = () => {
  return (
    <div>
        <DropDown 
        apiUrl="/api/inventory"
        inputName="inventory"
        placeholder="Search inventory..."
        />
    </div>
  )
}

export default page