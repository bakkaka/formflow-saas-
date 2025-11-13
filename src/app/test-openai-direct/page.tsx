'use client';

import { useEffect, useState } from 'react';

export default function TestOpenAIDirectPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testOpenAIDirect = async () => {
      try {
        console.log('🔍 Test direct OpenAI...');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Dis bonjour en français en une phrase.' }],
            max_tokens: 50
          })
        });

        console.log('📤 Statut:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Réponse:', data);
        
        setResult(data.choices[0].message.content);
      } catch (error: any) {
        console.error('❌ Erreur directe:', error);
        setResult('ERREUR: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    testOpenAIDirect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Test direct OpenAI en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Test Direct OpenAI</h1>
        <div className={`p-4 rounded ${
          result.includes('ERREUR') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}>
          <pre>{result}</pre>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Si vous voyez une phrase en français, l'API fonctionne !</p>
          <p>Si vous voyez une erreur, le problème vient d'OpenAI.</p>
        </div>
      </div>
    </div>
  );
}