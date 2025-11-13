import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ✅ Version encore plus sécurisée avec import conditionnel
let stripeInstance: any = null;

const initializeStripe = async () => {
  if (stripeInstance) return stripeInstance;
  
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY not available');
    return null;
  }

  try {
    // ✅ Import dynamique pour éviter les problèmes de build
    const { default: Stripe } = await import('stripe');
    stripeInstance = new Stripe(stripeKey);
    return stripeInstance;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formId = params.id;
    const { response_data } = await request.json();

    // Sauvegarder la réponse dans Supabase
    const { data, error } = await supabase
      .from('form_responses')
      .insert([
        {
          form_id: formId,
          response_data: response_data,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save response' },
        { status: 500 }
      );
    }

    // ✅ Stripe optionnel - initialisation asynchrone
    const stripe = await initializeStripe();
    if (stripe) {
      console.log('Stripe available for additional processing');
      // Ici vous pouvez ajouter la logique Stripe si nécessaire
    }

    return NextResponse.json({ 
      success: true, 
      response_id: data[0]?.id,
      message: 'Response saved successfully'
    });

  } catch (error) {
    console.error('Form submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}