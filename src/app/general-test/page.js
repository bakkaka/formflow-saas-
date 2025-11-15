// src/app/general-test/page.tsx
'use client';

import { useState } from 'react';

export default function GeneralTestPage() {
  const [message] = useState('Page de test générale - Fonctionnalité en développement');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🧪</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page de Test Générale
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            {message}
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-800 text-sm">
              <strong>Note :</strong> L'intégration OpenAI sera disponible après configuration.
              Les fonctionnalités de base restent accessibles.
            </p>
          </div>
          <div className="mt-8">
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retour au Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}