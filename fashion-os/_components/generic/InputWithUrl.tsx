'use client';

import React from 'react';
import { THEME } from '../constants/ui';
import { ExternalLink } from 'lucide-react';

interface InputWIthUrlProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    url?: string;
}

const InputWithURL = ({ url, error, value, ...props }: InputWIthUrlProps) => {
    const inputTheme = props.disabled ? THEME.TextInputReadOnly : THEME.TextInput;

    const handleOpenLink = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if(!url)  return;

        let targetUrl = url;

        const isInternal = url.startsWith('/');

        if (!isInternal && !url.startsWith('http')) {
            targetUrl = `https://${url}`;
        }

        window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    return (
        <div className="form-control w-full">
            <div className="relative flex items-center">
                <input
                    type="url"
                    value={value ?? ''}
                    className={`${inputTheme} w-full pr-10 ${error ? 'input-error' : ''}`}
                    placeholder="Provide a value"
                    {...props}
                />
                {url && (
                    <button
                        onClick={handleOpenLink}
                        type="button"
                        className="btn btn-ghost btn-sm absolute right-2 text-primary hover:bg-primary/10"
                        title="Open link in new tab"
                    >
                        <ExternalLink size={18} />
                    </button>
                )}
            </div>
            {error && (
                <label className="label">
                <span className="label-text-alt text-error">{error}</span>
                </label>
            )}
        </div>
    )
}

export default InputWithURL;