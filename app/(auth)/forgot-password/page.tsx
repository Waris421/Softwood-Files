'use client';

import { useState } from 'react';
import { Mail, Loader2, Send } from 'lucide-react';
import { THEME } from '@/_components/constants/ui';

const GetEmail = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setStatus(null);

        try {
            const backendRes = await fetch('/api/auth/request-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({email}),
            });

            //This is only to trick hackers, so that they don't get user's email addresses.
            if (backendRes.status === 404) {
                setStatus({ type: 'success', msg: 'An email has been sent to your email address. Check your inbox' });
                setEmail('');

                return;
            }

            if (!backendRes.ok) throw new Error('An error occured. Check with your admin');

            const { uid, token } = await backendRes.json();
            
            const host = window.location.origin;
            const resetLink = `${host}/reset-password/${uid}/${token}`

            const emailRes = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    subject: 'Password Reset Request',
                    text: `Please reset your password by clicking here: ${resetLink}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h2>Password Reset</h2>
                            <p>You requested a password reset. Click the button below to proceed:</p>
                            <a href="${resetLink}" style="background: #570df8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                            <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy this link: ${resetLink}</p>
                        </div>
                    `
                }),
            });

            if (emailRes.ok) {
                setStatus({ type: 'success', msg: 'Reset link sent! Please check your inbox.' });
                setEmail('');
            } else {
                throw new Error('Failed to send email.');
            }

        } catch (error: any) {
            setStatus({ type: 'error', msg: error.message || 'Something went wrong.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Reset Password
                    </h2>
                    <p className="text-sm text-base-content/70">
                        Enter your email and we'll send you a secure link to reset your password.
                    </p>
                    <form onSubmit={handlePasswordReset} className="form-control w-full mt-4 gap-4">
                        <div className="relative">
                            <input 
                                type="email"
                                placeholder="email@softwoodtextiles.com"
                                className={THEME.textInput}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <Mail className="absolute left-3 top-3 w-5 h-5 opacity-50" />
                        </div>
                        {status && (
                            <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'} text-sm`}>
                                <span>{status.msg}</span>
                            </div>
                        )}
                        <button
                            type="submit"
                            className={`${THEME.ButtonBasic} ${loading ? 'btn-disabled' : ''}`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Reset Link
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
};

export default GetEmail;