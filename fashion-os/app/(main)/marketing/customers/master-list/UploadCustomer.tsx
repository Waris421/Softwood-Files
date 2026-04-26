'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { FileUpload } from "@/_components/generic/FileUpload"

export default function UploadCustomer() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)
    const handleUpload = async () => {
        // Processing the uploaded data file
        if (!file) return

        setState('loading')
        setMessage(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/marketing/customers/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) throw new Error(data.message || 'Upload failed.')

            setState('success')
            setMessage('File uploaded successfully!')
            setFile(null)
        } catch (err: any) {
            setState('error')
            setMessage(err.message)
        }
    }
    return (
        <div className="max-w-2xl py-6">
            <p className="text-sm opacity-60 mb-6">Upload a CSV or XLSX file containing customer data.</p>

            <FileUpload
                file={file}
                onFileChange={setFile}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                subText="CSV and XLSX files only"
                maxSizeMB={10}
            />

            {message && (
                <div className={`mt-4 flex items-center gap-2 text-sm p-3 rounded-lg
                    ${state === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                    {state === 'success' && <CheckCircle size={16} />}
                    {message}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || state === 'loading'}
                className="mt-6 btn btn-primary disabled:opacity-50"
            >
                {state === 'loading' ? (
                    <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Uploading...
                    </span>
                ) : 'Upload File'}
            </button>
            {state === 'success' && (
                <button
                    onClick={() => router.push('/marketing/garment-shipments')}
                    className="mt-3 btn btn-success w-fit"
                >
                    Visualize Data
                </button>
            )}
        </div>
    )
}
