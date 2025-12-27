'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import React from 'react';
import { authenticate } from '@/app/actions/auth';
import { useSearchParams } from 'next/navigation';
import { THEME } from '@/_components/constants/ui';

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={THEME.ButtonBasic}
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? 'Logging in...' : 'Login'}
    </button>
  );
}

const LoginForm = () => {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/';
  
  const [state, formAction] = React.useActionState(authenticate, { message: null });

  return (
    <form action={formAction}>
      {state.message && (
          <div role="alert" className={THEME.ErrorAlert}>
            <span>{state.message}</span>
          </div>
      )}
      {nextPath && (
        <input type="hidden" name="next" value={nextPath} />
      )}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <input type="text" className={THEME.TextInput}
          name="username" autoComplete="username" required/>
      </div>
      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input type="password" className={THEME.TextInput}
          name="password" autoComplete="current-password" required/>
        
        <label className="label">
          <Link href="/forgot-password" className={THEME.HyperLink}>
            First Login or Forgot Password?
          </Link>
        </label>
      </div>
      <div className="form-control mt-6">
        <SubmitButton />
      </div>
    </form>
  )
}

export default LoginForm