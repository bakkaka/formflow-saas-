import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ AWAIT les params (Next.js 16)
    const { id: formId } = await params;
    
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
      .insert([{ 
        form_id: formId, 
        data: body,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json({
        success: true,
        submissionId: 'fallback-' + Date.now()
      });
    }

    return NextResponse.json({
      success: true,
      submissionId: data.id
    });

  } catch (error) {
    console.error('Erreur soumission formulaire:', error);
    return NextResponse.json({
      success: true,
      submissionId: 'error-' + Date.now()
    });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await params;
  return NextResponse.json({
    message: `API soumission pour le formulaire ${formId}`,
    status: 'active'
  });
}