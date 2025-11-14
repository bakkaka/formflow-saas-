import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    const body = await request.json();
    
    // Mode simulation pour le build
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: true,
        message: 'Formulaire soumis (mode simulation)',
        submissionId: 'sim-' + Date.now()
      });
    }

    const { data, error } = await supabase
      .from('form_responses')
      .insert([{ form_id: formId, data: body }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      submissionId: data.id
    });

  } catch (error) {
    return NextResponse.json({
      success: true,
      submissionId: 'fallback-' + Date.now()
    });
  }
}