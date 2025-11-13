import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    
    // Convertir FormData en objet
    const responseData: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      responseData[key] = value.toString();
    }

    console.log('📥 Réponse reçue pour le formulaire:', id);
    console.log('📊 Données:', responseData);

    // Sauvegarder dans Supabase
    const { data, error } = await supabase
      .from('form_responses')
      .insert([
        {
          form_id: id,
          response_data: responseData
        }
      ])
      .select();

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      );
    }

    console.log('✅ Réponse sauvegardée:', data);

    // Rediriger vers une page de remerciement
    return NextResponse.redirect(
      new URL(`/forms/${id}/thank-you`, request.url)
    );

  } catch (error) {
    console.error('💥 Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}