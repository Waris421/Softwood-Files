'use client'
// Workflow: user picks a file → clicks Upload → file POSTs to Django → on success show confirmation message.
import { useState } from "react"
import { CheckCircle } from "lucide-react"
import { FileUpload } from "@/_components/generic/FileUpload"

export default function UploadPage() {
    // file — what the user picked in the file picker, null until they select something
    const [file, setFile] = useState<File | null>(null)

    // state drives the UI: idle = waiting, loading = request in flight, success = uploaded, error = Django rejected the file
    const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    // message holds the success confirmation or error text from Django e.g. "Missing columns: ['HSCode']"
    const [message, setMessage] = useState<string | null>(null)

    // Sends the file to Django. On 200 → show success banner and clear the file picker.
    // On 4xx → stay on this page and show Django's error message so the user knows what to fix.
    const handleUpload = async () => {
        if (!file) return
        setState('loading')
        setMessage(null)
        const formData = new FormData()
        formData.append('file', file)   // Django expects the file under the key 'file'
        try {
            const res = await fetch('/api/marketing/export-data/upload-file', { method: 'POST', body: formData })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.message || 'Upload failed.')
            setState('success')
            setMessage('File uploaded successfully!')
            setFile(null)   // clears the picker so user can't re-upload the same file
        } catch (err: any) {
            setState('error')
            setMessage(err.message)
        }
    }

    return (
        <div className="w-full px-8 py-10">
            <h1 className="text-2xl font-bold mb-2">Upload Customer Data</h1>
            <div className="max-w-2xl py-6">
                <p className="text-sm opacity-60 mb-6">Upload a CSV or XLSX file containing customer data.</p>

                {/* Drag-and-drop file picker — calls setFile when the user selects a file */}
                <FileUpload
                    file={file}
                    onFileChange={setFile}
                    accept=".csv, .xlsx, .xls"
                    subText="CSV, XLSX and XLS files only"
                    maxSizeMB={10}
                />

                {/* Banner — green on success, red on error, hidden when no message */}
                {message && (
                    <div className={`mt-4 flex items-center gap-2 text-sm p-3 rounded-lg
                        ${state === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                        {state === 'success' && <CheckCircle size={16} />}
                        {message}
                    </div>
                )}

                {/* Disabled while no file is selected or a request is already in flight */}
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
            </div>
        </div>
    )
}
