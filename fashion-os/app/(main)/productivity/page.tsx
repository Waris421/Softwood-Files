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

        <DropDown 
        inputName='ThreadCount'
        placeholder='Select Counts'
        isStatic={true}
        staticOptions={[
          {value: '203', label: '20/3'},
          {value: '203E', label: '20/3 EPIC'},
          {value: '202', label: '20/2'},
          {value: '202E', label: '20/2 EPIC'},
          {value: '204', label: '20/4'},
        ]}

        />
    </div>
  )
}

export default page