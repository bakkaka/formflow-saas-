'use client';

import React, { ReactNode } from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';

type Props = { children: ReactNode };

// Provider sécurisé pour éviter les erreurs de build
export function SafeClerkProvider({ children }: Props) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Si la clé n'existe pas pendant le build → ne pas initialiser Clerk
  if (!key) {
    console.warn("⚠ Clerk désactivé pendant le build : clé NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY manquante");
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
