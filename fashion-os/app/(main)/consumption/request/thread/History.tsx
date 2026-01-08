'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

type ConsHistory = {
    RequestNumber: number,
    FullName: string,
    RequestDate: string,
    Status: string,
    Style: string,
}

export default function ConsumptionHistory() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();
    
    return (
        <div>
            
        </div>
    )
}