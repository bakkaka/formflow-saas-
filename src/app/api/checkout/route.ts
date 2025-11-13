import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// ✅ Initialisation Stripe sans version d'API obsolète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { priceId, planName } = await request.json();

    // Validation des données
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        planName: planName || 'Starter',
      },
      // ✅ Activation des promotions Stripe
      allow_promotion_codes: true,
      // ✅ Mode de facturation
      subscription_data: {
        trial_period_days: 14, // Essai gratuit de 14 jours
      },
    });

    // ✅ Retourne à la fois l'URL et le sessionId pour compatibilité
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    // Gestion d'erreur détaillée
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// ✅ Optionnel: Ajouter la méthode GET pour récupérer une session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Retrieve session error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}