'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface StripeContextType {
  stripe: Stripe | null;
  loading: boolean;
}

const StripeContext = createContext<StripeContextType>({
  stripe: null,
  loading: true
});

export const useStripe = () => useContext(StripeContext);

export default function StripeProvider({ children }: { children: React.ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Vérifier que la clé est disponible
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        
        if (!stripeKey) {
          console.warn('Stripe key not found in environment variables');
          setLoading(false);
          return;
        }

        console.log('Initializing Stripe with key:', stripeKey.substring(0, 20) + '...');
        
        const stripeInstance = await loadStripe(stripeKey);
        
        if (stripeInstance) {
          console.log('Stripe initialized successfully');
          setStripe(stripeInstance);
        } else {
          console.error('Stripe returned null instance');
        }
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  return (
    <StripeContext.Provider value={{ stripe, loading }}>
      {children}
    </StripeContext.Provider>
  );
}