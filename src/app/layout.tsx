'use client';

import React, { ReactNode } from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import './globals.css';

type Props = { children: ReactNode };

export function SafeClerkProvider({ children }: Props) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!key) {
    console.warn("⚠ Clerk désactivé pendant le build");
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider publishableKey={key} afterSignOutUrl="/">
      {children}
    </BaseClerkProvider>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SafeClerkProvider>
          {children}
        </SafeClerkProvider>
      </body>
    </html>
  );
}