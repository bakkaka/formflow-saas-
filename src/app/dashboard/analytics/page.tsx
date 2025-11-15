'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import ResponseAnalytics from '@/components/ResponseAnalytics';
import { SatisfactionChart } from '@/components/ResponseChart';

interface Form {
  id: string;
  title: string;
  created_at: string;
  user_id?: string;
}

export default function AnalyticsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setError(null);
      
      // 🔥 STRATÉGIE HYBRIDE : Essayer les vraies données d'abord
      const { data, error: supabaseError } = await supabase
        .from('forms')
        .select('id, title, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (supabaseError) throw supabaseError;
      
      if (data && data.length > 0) {
        console.log('📊 VRAIES données chargées:', data.length, 'formulaires');
        setForms(data);
        setSelectedForm(data[0].id);
      } else {
        // Fallback données démo
        console.log('📊 Mode démo activé');
        loadDemoData();
      }
    } catch (error: any) {
      console.error('Erreur chargement formulaires:', error);
      setError('Chargement en mode démonstration');
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    const mockForms: Form[] = [
      {
        id: 'demo-form-1',
        title: 'Sondage Satisfaction Clients',
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-form-2', 
        title: 'Formulaire Contact Entreprise',
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-form-3',
        title: 'Événement Conférence 2024',
        created_at: new Date().toISOString()
      }
    ];
    setForms(mockForms);
    setSelectedForm(mockForms[0].id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation des analytics...</p>
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
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-700 text-sm font-medium">Mode Démo</span>
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
              <div>
                <p className="text-yellow-800 font-medium">{error}</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Les données affichées sont une démonstration. Vos données réelles seront chargées après connexion.
                </p>
              </div>
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
                    {form.id.includes('demo') && ' (Démo)'}
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
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <span className="text-4xl mb-2 block">📈</span>
                        <p className="text-sm">Graphiques temps réel disponibles<br />avec vos données réelles</p>
                      </div>
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