'use client';

import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to DocWhisper</h1>
          <p className="text-sm text-gray-500 mt-1">
            Or <Link href="/" className="text-blue-600 underline">go back</Link>
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          view="sign_in"
          appearance={{ theme: ThemeSupa }}
          providers={['google']}         // remove this line if you want email-only
          magicLink
          redirectTo="/dashboard"
        />
      </div>
    </main>
  );
}
