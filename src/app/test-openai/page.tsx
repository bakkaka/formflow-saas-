'use client';

import { useEffect, useState } from 'react';
import { analyzeFormResponses } from '@/lib/openai';

export default function TestOpenAIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testOpenAI = async () => {
      try {
        console.log('🧪 Début du test OpenAI...');
        
        const testData = {
          fields: [
            { 
              id: 'satisfaction',
              question: "Niveau de satisfaction", 
              type: "select", 
              options: ["Très satisfait", "Satisfait", "Neutre", "Insatisfait"] 
            },
            { 
              id: 'note',
              question: "Note sur 5",
              type: "radio", 
              options: ["1", "2", "3", "4", "5"] 
            }
          ]
        };
        
        const testResponses = [
          { 
            id: '1',
            response_data: { 
              satisfaction: "Très satisfait",
              note: "5",
              commentaire: "Excellent service !"
            } 
          },
          { 
            id: '2',
            response_data: { 
              satisfaction: "Satisfait",
              note: "4", 
              commentaire: "Très bon mais un peu lent"
            } 
          },
          { 
            id: '3',
            response_data: { 
              satisfaction: "Neutre",
              note: "3",
              commentaire: "Peut mieux faire"
            } 
          }
        ];

        console.log('📤 Appel à OpenAI...');
        const analysis = await analyzeFormResponses(testResponses, testData);
        console.log('✅ Réponse reçue:', analysis);
        
        setResult(analysis);
      } catch (err: any) {
        console.error('❌ Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testOpenAI();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Test OpenAI en cours...</p>
          <p className="text-sm text-gray-500">Vérification de la connexion à l'API</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Erreur OpenAI</h1>
          <div className="bg-red-50 p-4 rounded mb-4">
            <p className="text-red-800 font-mono">{error}</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Vérifiez que :</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Votre clé API est dans <code>.env.local</code></li>
              <li>Vous avez des crédits OpenAI</li>
              <li>La clé API est valide</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test OpenAI - RÉUSSI !</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Connexion OpenAI fonctionne !</h2>
          <p className="text-green-700">L'analyse IA est maintenant opérationnelle dans votre application.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-800 mb-2">Insights</h3>
            <div className="space-y-2">
              {result.insights.map((insight: string, index: number) => (
                <p key={index} className="text-sm text-gray-600">• {insight}</p>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-800 mb-2">Résumé</h3>
            <p className="text-sm text-gray-600">{result.summary}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-800 mb-2">Recommandations</h3>
            <div className="space-y-2">
              {result.recommendations.map((rec: string, index: number) => (
                <p key={index} className="text-sm text-gray-600">→ {rec}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-4">Données brutes de l'analyse</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/dashboard/forms" 
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-block"
          >
            🚀 Retourner aux formulaires
          </a>
        </div>
      </div>
    </div>
  );
}