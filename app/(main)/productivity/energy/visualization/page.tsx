import { Metadata } from 'next'
import EnergyVisualization from './EnergyVisualization'

// sets the browser tab title for this page
export const metadata: Metadata = {
    title: 'Energy Visualization',
    description: 'View and filter energy consumption data by date range',
}

// renders the main component when someone visits /productivity/energy/visualization
export default function page() {
    return <EnergyVisualization />
}
