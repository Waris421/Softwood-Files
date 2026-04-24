'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import React, { useState } from 'react';
import { authenticate } from '@/app/actions/auth';
import { useSearchParams } from 'next/navigation';
import { THEME } from '@/_components/constants/ui';
import { AlertCircle, Loader2, User, Lock, EyeOff, Eye } from 'lucide-react';

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={THEME.ButtonBasic}
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Logging in...
        </>
      ) : (
        'Login'
      )}
    </button>
  );
}

const LoginForm = () => {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';
  const [showPassword, setShowPassword] = useState(false);
  
  const [state, formAction] = React.useActionState(authenticate, { message: null });

  return (
    <form action={formAction}>
      {/* Hidden field for redirect path */}
      <input type="hidden" name="next" value={nextPath} />
      
      {/* Error Alert */}
      {state.message && (
          <div role="alert" className={`${THEME.ErrorText}`}>
            <AlertCircle className="w-5 h-5" />
            <span>{state.message}</span>
          </div>
      )}

      {/* Username Input */}
      <div className="form-control">
        <label className="label" htmlFor="username">
          <span className="label-text font-medium">Username</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
            <User size={18} />
          </div>
          <input 
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            autoComplete="username"
            required
            className={`${THEME.TextInput} pl-10 pr-10`}
          />
        </div>
      </div>

      {/* Pasword Input */}
      <div className="form-control">
        <label className="label" htmlFor="password">
          <span className="label-text font-medium">Password</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
            <Lock size={18} />
          </div>
          <input 
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className={`${THEME.TextInput} pl-10 pr-10`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/50 hover:text-primary"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex justify-end mt-1">
          <Link href="/forgot-password" className={THEME.HyperLink}>
            First Login or Forgot Password?
          </Link>
        </div>
      </div>
      <div className="form-control mt-6">
        <SubmitButton />
      </div>
    </form>
  )
}

export default LoginForm