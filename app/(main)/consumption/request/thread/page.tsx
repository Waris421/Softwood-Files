import { Metadata } from "next"
import ConsumptionHistory from "./History"

export const metadata: Metadata = {
  title: 'Consumption History',
  description: 'Thread Consumption History',
}

const page = async () => {
    return (
        <ConsumptionHistory />
    )
}

export default page