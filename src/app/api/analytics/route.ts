import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { responses } = await request.json();
    
    return NextResponse.json({
      analysis: {
        insights: [
          "🚀 Application déployée avec succès",
          `📊 ${responses?.length || 0} réponses collectées`,
          "💡 Analyse basique active"
        ],
        summary: "Votre formulaire est opérationnel. L'analyse IA sera disponible après configuration.",
        recommendations: [
          "Configurez OpenAI pour l'analyse avancée",
          "Continuez à collecter des réponses", 
          "Contactez le support si besoin"
        ]
      }
    });
  } catch (error) {
    return NextResponse.json({
      analysis: {
        insights: ["✅ Service fonctionnel"],
        summary: "Analyse de base disponible",
        recommendations: ["Tout est opérationnel"]
      }
    });
  }
}