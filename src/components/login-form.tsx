'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const DynamicLoginForm = dynamic(
  () => import('./login-form-content').then(mod => mod.LoginFormContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
);

export function LoginForm() {
  return <DynamicLoginForm />;
}
