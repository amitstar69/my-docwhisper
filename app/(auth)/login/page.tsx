'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectPath = redirectParam?.startsWith('/') ? redirectParam : '/dashboard';
  const fallbackOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = typeof window === 'undefined' ? fallbackOrigin : window.location.origin;
  const redirectTo = origin ? new URL(redirectPath, origin).toString() : redirectPath;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-3xl font-bold">Sign in to DocWhisper</h1>
          <p className="text-sm text-slate-500">
            Or{' '}
            <Link href="/" className="text-blue-600 underline">
              return home
            </Link>
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          magicLink
          redirectTo={redirectTo}
        />
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-6">
          <p className="text-slate-500">Loading authentication…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
