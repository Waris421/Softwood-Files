import { Metadata } from "next"
import PendingConsumptions from "./Pending";

export const metadata: Metadata = {
  title: 'Pending Consumptions',
  description: 'Pending Consumptions',
}

const page = async () => {
    return (
        <PendingConsumptions />
    )
}

export default page