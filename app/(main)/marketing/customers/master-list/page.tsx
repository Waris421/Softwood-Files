'use client'
// Filter state now lives in the URL — ShipmentFilters writes to it, ShipmentDetails reads from it.
import UploadCustomer from './UploadCustomer'
import ShipmentFilters from './ShipmentFilters'
import ShipmentDetails from './ShipmentDetails'

export default function MasterListPage() {
    return (
        <div className="w-full px-8 py-10">
            <h1 className="text-2xl font-bold mb-2">Customer Master List</h1>
            <UploadCustomer />
            <ShipmentFilters />
            <ShipmentDetails />
            <p className="text-xs opacity-40 mt-12 text-center tracking-widest">.. / -. . . -.. / - .-. ..- . / . -- --- - .. --- -. ...</p>
        </div>
    )
}
