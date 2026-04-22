'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { THEME } from '@/_components/constants/ui';

const ResetPasswordPage = () => {
    const params = useParams();
    const router = useRouter();

    const { uid, token } = params;

    const [verifying, setVerifying] = useState(true);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                if (!uid || !token) {
                    router.push('/forgot-password');
                    return;
                }
                const res = await fetch(`/api/auth/reset-confirm/${uid}/${token}`, {
                    method: 'GET',
                });

                if (!res.ok) {
                    router.push(`/forgot-password`);
                } else {
                    setVerifying(false);
                }
            } catch (err) {
                router.push('/forgot-password');
            }
        };
        verifyToken();
    }, [uid, token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return ;
        }

        setLoading(true);

        try {
            const res = await fetch(`/api/auth/reset-confirm/${uid}/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password1: password,
                    password2: confirmPassword,
                }),
            });

            if (res.ok) {
                router.push('/login');
            } else {
                const data = await res.json();
                setError(data.message || "Failed to reset password.");
            }

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false)
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium">Verifying your credentials......</p>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex flex-col items-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full mb-2">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="card-title text-2xl font-bold text-center">Set New Password</h2>
                        <p className="text-sm text-base-content/60 text-center">
                            Please enter your new password below.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">New Password</span>
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className={THEME.TextInput}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 opacity-50 hover:opacity-100"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Confirm Password</span>
                            </label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className={THEME.TextInput}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="alert alert-error text-sm py-2">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`${THEME.ButtonBasic} ${loading ? 'btn-disabled' : ''}`}
                        >
                            {!loading && <CheckCircle2 className="w-4 h-4 mr-2" />}
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordPage;