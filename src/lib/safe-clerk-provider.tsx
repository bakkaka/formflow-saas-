'use client';

import React, { ReactNode } from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';

type Props = { children: ReactNode };

export function SafeClerkProvider({ children }: Props) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // SI aucune clé → ne PAS charger Clerk pendant le build
  if (!key) {
    console.warn("Clerk disabled during build (no publishableKey)");
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider publishableKey={key} afterSignOutUrl="/">
      {children}
    </BaseClerkProvider>
  );
}
