import OpenAI from 'openai';

// Debug: Vérifier si la clé est chargée
console.log('API Key from process.env:', process.env.OPENAI_API_KEY);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('OPENAI')));

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
// Types
export type AnalysisResult = {
  insights: string[];
  summary: string;
  recommendations: string[];
};

// Fonction de test (serveur uniquement)
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Réponds simplement 'OK'." }],
      max_tokens: 10,
    });

    console.log('✅ OpenAI fonctionne:', completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ Erreur OpenAI:', error);
    return false;
  }
}

// Fonction d’analyse principale
export async function analyzeFormResponses(
  responses: any[],
  formStructure: any
): Promise<AnalysisResult> {
  if (responses.length === 0) {
    return {
      insights: ["📊 Aucune donnée à analyser"],
      summary: "Pas encore de réponses collectées",
      recommendations: ["Collectez des réponses avant l’analyse"],
    };
  }

  try {
    const prompt = `
Analyse ces réponses de formulaire :
${JSON.stringify(responses.slice(0, 5))}
Formulaire : ${JSON.stringify(formStructure)}

Donne 3 insights, 1 résumé et 2 recommandations en français.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un expert analyste de formulaires." },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
    });

    const text = completion.choices[0].message.content || "";

    return {
      insights: text.match(/- (.*)/g)?.slice(0, 3) || ["Analyse IA en cours..."],
      summary: text,
      recommendations: ["Poursuivez la collecte de données", "Analysez plus de réponses"],
    };
  } catch (error) {
    console.error('Erreur analyseFormResponses:', error);
    return {
      insights: ["Erreur d’analyse IA"],
      summary: "Impossible d’analyser pour l’instant",
      recommendations: ["Réessayez plus tard"],
    };
  }
}
