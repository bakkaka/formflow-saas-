'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase-client';
import ResponseAnalytics from '@/components/ResponseAnalytics';
import { SatisfactionChart } from '@/components/ResponseChart';

interface Form {
  id: string;
  title: string;
  created_at: string;
}

export default function AnalyticsPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Attendre que Clerk soit chargé OU utiliser le mode démo immédiatement
    if (!userLoaded) {
      // Mode démo pendant le build
      loadDemoData();
      return;
    }

    if (user) {
      loadForms();
    } else {
      // Pas d'utilisateur connecté, mode démo
      loadDemoData();
    }
  }, [user, userLoaded]);

  const loadDemoData = () => {
    console.warn('Chargement données démo Analytics');
    const mockForms = [
      {
        id: 'demo-form-1',
        title: 'Formulaire de démonstration Analytics',
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-form-2',
        title: 'Sondage satisfaction (Démo)',
        created_at: new Date().toISOString()
      }
    ];
    setForms(mockForms);
    setSelectedForm(mockForms[0].id);
    setLoading(false);
  };

  const loadForms = async () => {
    try {
      setError(null);
      
      // ✅ Vérification que Supabase est configuré
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.warn('Supabase non configuré - mode démo Analytics');
        loadDemoData();
        return;
      }

      const { data, error } = await supabase
        .from('forms')
        .select('id, title, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setForms(data || []);
      
      if (data && data.length > 0) {
        setSelectedForm(data[0].id);
      } else {
        // Aucun formulaire, mode démo
        loadDemoData();
      }
    } catch (error: any) {
      console.error('Erreur chargement formulaires:', error);
      setError('Erreur lors du chargement des formulaires');
      
      // Fallback avec données mockées
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600">Analysez les performances de vos formulaires</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertes */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠</span>
              <p className="text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !user) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">💡</span>
              <p className="text-blue-800">
                Mode démo Analytics - Connectez-vous et configurez Supabase pour les données réelles
              </p>
            </div>
          </div>
        )}

        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune donnée d'analytics
              </h3>
              <p className="text-gray-600 mb-6">
                Créez votre premier formulaire et collectez des réponses pour voir vos analytics.
              </p>
              <a
                href="/dashboard/forms/new"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-block"
              >
                Créer un formulaire
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sélecteur de formulaire */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner un formulaire à analyser
              </label>
              <select
                value={selectedForm || ''}
                onChange={(e) => setSelectedForm(e.target.value)}
                className="w-full md:w-96 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.title} 
                    {(form.id.includes('demo') || form.id.includes('fallback')) && ' (Démo)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Analytics du formulaire sélectionné */}
            {selectedForm && (
              <>
                <ResponseAnalytics formId={selectedForm} />
                
                {/* Section Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Satisfaction des utilisateurs
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                      <SatisfactionChart 
                        data={{
                          'Très satisfait': 45,
                          'Satisfait': 30,
                          'Neutre': 15,
                          'Insatisfait': 8,
                          'Très insatisfait': 2
                        }} 
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Réponses par période
                    </h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      {selectedForm.includes('demo') || selectedForm.includes('fallback') ? (
                        <div className="text-center">
                          <span className="text-4xl mb-2">📈</span>
                          <p className="text-sm">Graphiques disponibles avec<br />Supabase configuré</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-4xl mb-2">📊</span>
                          <p className="text-sm">Analytics temps réel<br />avec vos données</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}