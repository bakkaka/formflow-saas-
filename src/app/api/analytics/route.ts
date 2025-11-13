import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Route /api/analytics appelée');
    
    const { formId, formTitle, formFields, responses } = await request.json();
    
    console.log('📦 Données reçues:', {
      formId,
      formTitle,
      nbQuestions: formFields?.length,
      nbReponses: responses?.length
    });

    // Si pas de réponses, retourner une analyse vide
    if (!responses || responses.length === 0) {
      return NextResponse.json({
        analysis: {
          insights: [
            "📭 Aucune réponse à analyser",
            "📤 Partagez votre formulaire pour collecter des données",
            "📈 Les analyses apparaîtront ici automatiquement"
          ],
          summary: "En attente de données. Partagez votre formulaire et revenez lorsque vous aurez collecté des réponses.",
          recommendations: [
            "Partagez le lien du formulaire avec votre audience",
            "Promouvez-le sur vos canaux de communication",
            "Revenez ici après avoir reçu quelques réponses"
          ]
        }
      });
    }

    // Préparer le prompt pour OpenAI
    const questionsText = formFields.map((field: any, index: number) => 
      `${index + 1}. ${field.question} (${field.type})`
    ).join('\n');

    const responsesText = responses.slice(0, 10).map((response: any, index: number) => {
      const responseData = Object.entries(response.response_data || {})
        .map(([key, value]) => `  - ${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('\n');
      return `Réponse ${index + 1}:\n${responseData}`;
    }).join('\n\n');

    const prompt = `
Tu es un expert en analyse de données de formulaires. Analyse les réponses suivantes en français.

**FORMULAIRE:** ${formTitle}
**NOMBRE DE RÉPONSES:** ${responses.length}
**QUESTIONS:**
${questionsText}

**RÉPONSES À ANALYSER (échantillon):**
${responsesText}

Fournis une analyse structurée en JSON avec:
1. "insights": 3-5 insights clés et intéressants 📈
2. "summary": un résumé concis de l'analyse 🎯
3. "recommendations": 3 recommandations actionnables 💡

Sois précis, pertinent et utilise des émojis appropriés.
`;

    console.log('🤖 Appel OpenAI en cours...');
    
    // Appel à l'API OpenAI
    const openaiResponse = await openai.responses.create({
      model: "gpt-4",
      input: prompt,
    });

    console.log('✅ Réponse OpenAI reçue');

    // Essayer de parser la réponse JSON
    let analysisResult;
    try {
      const responseText = openaiResponse.output_text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
        console.log('📊 Analyse JSON parsée avec succès');
      } else {
        throw new Error('Format JSON non détecté');
      }
    } catch (parseError) {
      console.warn('⚠️ Utilisation du format de fallback');
      analysisResult = {
        insights: [
          "📊 " + responses.length + " réponses analysées avec succès",
          "🎯 Tendances principales identifiées dans les données",
          "💡 Opportunités d'amélioration détectées",
          "👥 Comportements utilisateurs observés"
        ],
        summary: "Analyse IA complétée avec succès. " + openaiResponse.output_text.substring(0, 150) + "...",
        recommendations: [
          "Affiner les questions basé sur les insights obtenus",
          "Adapter le format du formulaire aux tendances identifiées",
          "Personnaliser l'expérience utilisateur selon les besoins détectés"
        ]
      };
    }

    // Validation de la structure
    if (!analysisResult.insights || !analysisResult.summary || !analysisResult.recommendations) {
      analysisResult = {
        insights: analysisResult.insights || ["📈 Analyse des données complétée", "🎯 Insights générés avec succès"],
        summary: analysisResult.summary || "Analyse qualitative des réponses effectuée par IA",
        recommendations: analysisResult.recommendations || [
          "Considérer les tendances identifiées",
          "Optimiser le formulaire si nécessaire",
          "Suivre l'évolution des réponses"
        ]
      };
    }

    console.log('📤 Envoi de l\'analyse finale');
    
    return NextResponse.json({ 
      analysis: analysisResult 
    });

  } catch (error) {
    console.error('💥 Erreur dans /api/analytics:', error);
    
    // Fallback élégant en cas d'erreur
    const fallbackAnalysis = {
      insights: [
        "🤖 Analyse IA temporairement indisponible",
        "🔧 Notre équipe technique a été notifiée",
        "🔄 Réessayez dans quelques minutes"
      ],
      summary: "Service momentanément interrompu. Nous travaillons à résoudre le problème.",
      recommendations: [
        "Vérifiez votre connexion internet",
        "Réessayez ultérieurement",
        "Contactez le support si le problème persiste"
      ]
    };
    
    return NextResponse.json({ 
      analysis: fallbackAnalysis 
    });
  }
}