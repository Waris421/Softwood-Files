'use client' // runs in the browser, not the server

import { useState } from "react"; // stores values that update the screen when they change
import { CheckCircle } from "lucide-react"; // green tick icon shown on success
import { FileUpload } from "@/_components/generic/FileUpload"; // handles drop zone, file selection, and file display

// limits uploadState to only these 4 values — typescript will error if you use anything else
type UploadState = 'idle' | 'loading' | 'success' | 'error';

export default function UploadCSV() {

    const [file, setFile] = useState<File | null>(null); // the selected CSV file, null means nothing selected
    const [uploadState, setUploadState] = useState<UploadState>('idle'); // tracks where we are in the upload process
    const [message, setMessage] = useState<string | null>(null); // success or error text shown after an upload attempt

    // runs when the Upload button is clicked — sends the file to Django via our API route
    const handleUpload = async () => {
        if (!file) return; // stop immediately if no file selected

        setUploadState('loading'); // show spinner on button
        setMessage(null); // clear any previous message

        const formData = new FormData(); // packages the file for sending over the internet
        formData.append('file', file); // 'file' is the key Django uses to find it

        try {
            const response = await fetch('/api/energy/upload', { // send to our Next.js API route
                method: 'POST',
                body: formData,
            });

            const data = await response.json().catch(() => ({})); // parse response, fall back to empty object if body is missing

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed.'); // jumps to catch block below
            }

            setUploadState('success');
            setMessage('File uploaded successfully!');
            setFile(null); // reset the drop zone
        } catch (err: any) {
            setUploadState('error'); // show error message to user
            setMessage(err.message);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <h1 className="text-2xl font-bold mb-2">Energy Consumption</h1>
            <p className="text-sm opacity-60 mb-8">Upload a CSV or XLSX file containing energy consumption data.</p>

            {/* drop zone — onFileChange wires directly to setFile so picking a file updates our state */}
            <FileUpload
                file={file}
                onFileChange={setFile}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                subText="CSV and XLSX files only"
                maxSizeMB={10}
                helperText="Date, Location, Energy_KWH, Cost"
            />

            {/* only renders when message is not null — green for success, red for error */}
            {message && (
                <div className={`mt-4 flex items-center gap-2 text-sm p-3 rounded-lg
                    ${uploadState === 'success' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                    {uploadState === 'success' && <CheckCircle size={16} />}
                    {message}
                </div>
            )}

            {/* disabled when no file selected OR upload in progress — ? : shows spinner or label */}
            <button
                onClick={handleUpload}
                disabled={!file || uploadState === 'loading'}
                className="mt-6 w-full btn btn-primary disabled:opacity-50"
            >
                {uploadState === 'loading' ? (
                    <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Uploading...
                    </span>
                ) : 'Upload File'}
            </button>
        </div>
    );
}

