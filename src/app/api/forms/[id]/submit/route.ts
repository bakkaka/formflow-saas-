import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formId = params.id;
    const { response_data } = await request.json();

    // Save to Supabase only - Stripe removed from this endpoint
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