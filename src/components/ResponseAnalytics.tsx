'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';

interface ResponseAnalyticsProps {
  formId: string;
}

interface Response {
  id: string;
  response_data: Record<string, string>;
  created_at: string;
}

interface Analytics {
  totalResponses: number;
  responsesByDay: Record<string, number>;
  fieldStats: Record<string, {
    total: number;
    empty: number;
    completionRate: number;
  }>;
}

export default function ResponseAnalytics({ formId }: ResponseAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Response[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResponses();
  }, [formId]);

  const loadResponses = async () => {
    try {
      setError(null);
      
      // ✅ Vérification Supabase pour le build
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.warn('Supabase non configuré - mode démo ResponseAnalytics');
        
        // Données mockées pour le build
        const mockResponses = [
          {
            id: 'demo-response-1',
            response_data: {
              'nom': 'Jean Dupont',
              'email': 'jean@example.com',
              'satisfaction': 'Très satisfait'
            },
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-response-2',
            response_data: {
              'nom': 'Marie Martin',
              'email': 'marie@example.com',
              'satisfaction': 'Satisfait'
            },
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        
        setResponses(mockResponses);
        calculateAnalytics(mockResponses);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResponses(data || []);
      calculateAnalytics(data || []);
    } catch (error: any) {
      console.error('Erreur chargement réponses:', error);
      setError('Erreur lors du chargement des réponses');
      
      // Fallback avec données mockées
      const mockResponses = [
        {
          id: 'fallback-response-1',
          response_data: {
            'question1': 'Réponse exemple 1',
            'question2': 'Réponse exemple 2'
          },
          created_at: new Date().toISOString()
        }
      ];
      
      setResponses(mockResponses);
      calculateAnalytics(mockResponses);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (responseData: Response[]) => {
    const responsesByDay: Record<string, number> = {};
    const fieldStats: Record<string, { total: number; empty: number; completionRate: number }> = {};

    responseData.forEach(response => {
      try {
        // Statistiques par jour
        const date = new Date(response.created_at).toLocaleDateString('fr-FR');
        responsesByDay[date] = (responsesByDay[date] || 0) + 1;

        // Statistiques par champ
        if (response.response_data) {
          Object.entries(response.response_data).forEach(([fieldId, value]) => {
            if (!fieldStats[fieldId]) {
              fieldStats[fieldId] = { total: 0, empty: 0, completionRate: 0 };
            }
            fieldStats[fieldId].total++;
            if (!value || value.trim() === '') {
              fieldStats[fieldId].empty++;
            }
          });
        }
      } catch (err) {
        console.warn('Erreur calcul statistiques pour réponse:', response.id, err);
      }
    });

    // Calcul des taux de completion
    Object.keys(fieldStats).forEach(fieldId => {
      const stats = fieldStats[fieldId];
      stats.completionRate = stats.total > 0 ? ((stats.total - stats.empty) / stats.total) * 100 : 0;
    });

    setAnalytics({
      totalResponses: responseData.length,
      responsesByDay,
      fieldStats
    });
  };

  const isDemoData = formId.includes('demo') || formId.includes('fallback');

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Chargement des analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertes */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠</span>
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {isDemoData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">💡</span>
            <p className="text-blue-800">
              Données de démonstration - Analytics en temps réel disponibles avec Supabase configuré
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Total Réponses</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {analytics?.totalResponses || 0}
          </p>
          {isDemoData && (
            <p className="text-xs text-gray-500 mt-1">Données démo</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Aujourd'hui</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics?.responsesByDay[new Date().toLocaleDateString('fr-FR')] || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Taux Completion</h3>
          <p className="text-3xl font-bold text-blue-600">
            {analytics && Object.keys(analytics.fieldStats).length > 0 
              ? Math.round(
                  Object.values(analytics.fieldStats).reduce((acc, stat) => acc + stat.completionRate, 0) / 
                  Object.keys(analytics.fieldStats).length
                )
              : 0}%
          </p>
        </div>
      </div>

      {/* Liste des réponses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Dernières Réponses ({responses.length})
            {isDemoData && <span className="text-blue-600 text-sm ml-2">• Démo</span>}
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {responses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📝</span>
              </div>
              Aucune réponse collectée pour le moment
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {responses.map((response, index) => (
                <div key={response.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500 font-medium">
                      Réponse #{responses.length - index}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(response.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {response.response_data && Object.entries(response.response_data).map(([fieldId, value]) => (
                      <div key={fieldId} className="text-sm">
                        <span className="font-medium text-gray-700 capitalize">
                          {fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {value && value.trim() !== '' 
                            ? value 
                            : <em className="text-gray-400">Non renseigné</em>
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistiques des champs */}
      {analytics && Object.keys(analytics.fieldStats).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance des Champs
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(analytics.fieldStats).map(([fieldId, stats]) => (
              <div key={fieldId} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4 capitalize">
                  {fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${stats.completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {Math.round(stats.completionRate)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}