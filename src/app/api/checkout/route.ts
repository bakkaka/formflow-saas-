import { NextRequest, NextResponse } from 'next/server';

// ✅ Stripe initialization with dynamic import
const getStripe = async () => {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      console.warn('STRIPE_SECRET_KEY not available');
      return null;
    }

    // ✅ Dynamic import to avoid build issues
    const { default: Stripe } = await import('stripe');
    return new Stripe(stripeKey);
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { priceId, planName } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const stripe = await getStripe();
    
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment service temporarily unavailable' },
        { status: 503 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        planName: planName || 'Starter',
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}