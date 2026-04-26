// Displays the customer master list fetched from the backend
import UploadCustomer from './UploadCustomer'

const page = () => (
  <div className="w-full px-8 py-10">
    <h1 className="text-2xl font-bold mb-2">Customer Master List</h1>
    <UploadCustomer />
  </div>
)
export default page

