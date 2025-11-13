'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ThankYouPage() {
  const params = useParams();
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const formId = params.id as string;

  // Charger le titre du formulaire
  useEffect(() => {
    const loadFormTitle = async () => {
      try {
        const { data } = await supabase
          .from('forms')
          .select('title')
          .eq('id', formId)
          .single();

        if (data) {
          setFormTitle(data.title);
        }
      } catch (error) {
        console.error('Erreur chargement titre:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormTitle();
  }, [formId]);

  const handleSubmitAnother = () => {
    router.push(`/forms/${formId}`);
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Icône de succès */}
        <div className="bg-white rounded-full p-6 shadow-lg inline-block mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        {/* Message de remerciement */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Merci ! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          Votre réponse a été enregistrée avec succès.
        </p>

        {formTitle && (
          <p className="text-gray-500 mb-8">
            Pour le formulaire : <strong>"{formTitle}"</strong>
          </p>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleSubmitAnother}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            📝 Soumettre une autre réponse
          </button>
          
          <button
            onClick={handleReturnHome}
            className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
          >
            🏠 Retour à l'accueil
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Powered by FormFlow AI
          </p>
        </div>
      </div>
    </div>
  );
}