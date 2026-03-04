'use client';

import React, { useState } from 'react';
import { Cell, ColumnDef } from "@tanstack/react-table";
import { useRouter } from 'next/navigation';
import { FileUp, FileText, Check, Loader2, X, AlertCircle } from 'lucide-react';
import MessageBox from '@/_components/generic/MessageBox';
import { FormField } from '@/_components/generic/FormItems';
import { THEME } from '@/_components/constants/ui';
import { DataTable } from '@/_components/table/Table';
import TableDialog from '@/_components/DialogBox/TableDialog';
import { FileUpload } from '@/_components/generic/FileUpload';

type FormSchema = {
    file: File | null;
}

const VALIDATION_SCHEMA = {
    file: (val: File | null) => {
        if (!val) return 'Please select a file to upload';
        const allowedExtensions = ['csv', 'xlsx'];
        const extension = val.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedExtensions.includes(extension)) {
            return 'Only .csv and .xlsx files are supported';
        }
        return null;
    }
}

type WorkerPreview = {
    Code: number,
    Name: string,
    FatherSpouseName: string,
    CNIC: string,
    Department: string,
    SubDepartment: string,
    Manager: string,
    DateOfBirth: string,
    Gender: string,
    UserCreation: string,
}

const previewColumns: ColumnDef<WorkerPreview>[] = [
    {accessorKey: 'id', header: 'Code'},
    {accessorKey: 'WorkerName', header: 'Name'},
    {accessorKey: 'FatherSpouseName', header: 'Father/Spouse'},
    {accessorKey: 'CNIC', header: 'CNIC'},
    {accessorKey: 'Department', header: 'Department'},
    {accessorKey: 'SubDepartment', header: 'Section'},
    {accessorKey: 'Manager', header: 'Manager'},
    {accessorKey: 'DateOfBirth', header: 'DOB'},
    {accessorKey: 'Gender', header: 'Gender'},
    {accessorKey: 'UserCreation', header: 'User Creation'},

]

interface UserDetail {
    Username: string,
    Email: string,
}

export default function WorkerAddForm() {
    const [formData, setFormData] = useState<FormSchema>({ file: null });
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [anchorRef, setAnchorRef] = useState<HTMLElement | null>(null);
    const [userDetail, setUserDetail] = useState<UserDetail[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [importToken, setImportToken] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messageConfig, setMessageConfig] = useState<{ show: boolean; subject: string; message: string; action?: () => void; } | null>(null);
    const router = useRouter();

    const handleFileChange = (file: File | null) => {
        setFormData({ file });
        if (errors.file) {
            setErrors({});
        }
    };

    const validateForm = () => {
        const errorMessage = VALIDATION_SCHEMA.file(formData.file);

        if (errorMessage) {
            setErrors({ file: errorMessage });
            return false;
        }

        setErrors({});
        return true;
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        const data = new FormData();
        data.append('file', formData.file!);

        const response = await fetch('/api/hr/workers/bulk-add?dry_run=true', {
            method: 'POST',
            body: data,
        })
        
        if (!response.ok) {
            const error = await response.json();
            setMessageConfig({
                show: true,
                subject: "Error",
                message: `Saving Failed: ${error.message || error}`
            });
            setIsSubmitting(false);
            return ;
        }

        const result = await response.json();

        setPreviewData(result.rows);
        setImportToken(result.token);

        setIsSubmitting(false);
    }

    const handleConfirm = async () => {
        setIsSubmitting(true);

        const hasAnyErrors = previewData?.some(item => item.HasError === true);

        if (hasAnyErrors) {
            setMessageConfig({
                show: true,
                subject: "Error",
                message: 'There are errors in the uploaded data. Please rectify'
            });
            setIsSubmitting(false);
            return ;
        }

        const data = new FormData();
        data.append('token', importToken!);

        const response = await fetch('/api/hr/workers/bulk-add?dry_run=false', {
            method: 'POST',
            body: data,
        });

        if (!response.ok) {
            const error = await response.json();
            setMessageConfig({
                show: true,
                subject: "Error",
                message: `Saving Failed: ${error.message || error}`
            });
            setIsSubmitting(false);
            return ;
        }

        const result = await response.json();
        const numberOfEmployees = result['numberOfAddedEmployees'];

        setIsSubmitting(false);

        setMessageConfig({
            show: true,
            subject: 'Success',
            message: `${numberOfEmployees} employees added successfully.`,
            action: () => {
                router.push('/hr/worker')
            }
        })
    }

    const onCellClickFunction = (cell: Cell<any, any>, e?: React.MouseEvent) => {
        if (cell.getValue() == 'No') return ;

        const rowData = cell.row.original;
        const userDetails = [{
            Username: rowData.Username,
            Email: rowData.EmailAddress,
        }];

        if (e) setAnchorRef(e.currentTarget as HTMLElement);

        setUserDetail(userDetails);
        setIsOpen(true);
    }

    return (
        <div>
            {/* File upload Form*/}
            <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-xl shadow-xl border border-base-200">
                <div className="flex items-center gap-3 mb-8 border-b pb-4">
                    <FileUp className="text-primary w-6 h-6" />
                    <h2 className="text-2xl font-bold">Import Workers Data</h2>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                    <FormField label="Attachment" error={errors.file} required>
                        <FileUpload
                            file={formData.file}
                            onFileChange={(file) => setFormData({ ...formData, file })}
                            helperText="Code, Name, FatherSpouse, DateOfBirth, Department, SubDepartment, ManagerCode, Gender, CNIC, Username, EmailAddress"
                        />
                    </FormField>

                    <div className="mt-4 flex flex-row items-center gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.file}
                            className={`${THEME.ButtonBasic} flex-1 flex items-center justify-center gap-2`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ): (
                                <Check className="w-4 h-4" />
                            )}
                            {isSubmitting ? 'Processing File...' : 'Show Preview'}
                        </button>
                        
                        {previewData && (
                            <button
                                type="button"
                                disabled={isSubmitting}
                                className={`${THEME.ButtonSecondary} flex-1 flex items-center justify-center gap-2`}
                                onClick={handleConfirm}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ): (
                                    <Check className="w-4 h-4" />
                                )}
                                {isSubmitting ? 'Processing Data...' : 'Confirm'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
            
            {/* Preview of the uploaded file */}
            {previewData && (
                <div className="container mx-auto py-10 relative">
                    <DataTable
                        title='Data Preview'
                        data={previewData}
                        columns={previewColumns}
                        showPrint={false}
                        showDownload={false}
                        isLoading={isSubmitting}
                        clickableColumnId='UserCreation'
                        onCellClick={onCellClickFunction}
                        getRowClassName={(row) => {
                            if (row.HasError) return 'bg-red-900'; else return '';
                        }}
                    />
                </div>
            )}

            {/* Any wanrning/message box */}
            {messageConfig?.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <MessageBox 
                        subject={messageConfig.subject}
                        message={messageConfig.message}
                        confirmText="Close"
                        onConfirm={() => {
                            if (messageConfig.action) {
                                messageConfig.action();
                            }
                            setMessageConfig(null)
                        }}  
                    />
                </div>
            )}

            {/* User's details */}
            {isOpen && (
                <TableDialog
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    data={userDetail}
                    title="User Details"
                    anchorRef={anchorRef ? { current: anchorRef } : undefined}
                    maxWidth={500}
                />
            )}
        </div>
    )
}