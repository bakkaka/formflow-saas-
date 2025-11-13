'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

  useEffect(() => {
    loadResponses();
  }, [formId]);

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', formId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResponses(data || []);
      calculateAnalytics(data || []);
    } catch (error) {
      console.error('Erreur chargement réponses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (responseData: Response[]) => {
    const responsesByDay: Record<string, number> = {};
    const fieldStats: Record<string, { total: number; empty: number; completionRate: number }> = {};

    responseData.forEach(response => {
      // Statistiques par jour
      const date = new Date(response.created_at).toLocaleDateString('fr-FR');
      responsesByDay[date] = (responsesByDay[date] || 0) + 1;

      // Statistiques par champ
      Object.entries(response.response_data).forEach(([fieldId, value]) => {
        if (!fieldStats[fieldId]) {
          fieldStats[fieldId] = { total: 0, empty: 0, completionRate: 0 };
        }
        fieldStats[fieldId].total++;
        if (!value || value.trim() === '') {
          fieldStats[fieldId].empty++;
        }
      });
    });

    // Calcul des taux de completion
    Object.keys(fieldStats).forEach(fieldId => {
      const stats = fieldStats[fieldId];
      stats.completionRate = ((stats.total - stats.empty) / stats.total) * 100;
    });

    setAnalytics({
      totalResponses: responseData.length,
      responsesByDay,
      fieldStats
    });
  };

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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900">Total Réponses</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {analytics?.totalResponses || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900">Aujourd'hui</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics?.responsesByDay[new Date().toLocaleDateString('fr-FR')] || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900">Taux Completion</h3>
          <p className="text-3xl font-bold text-blue-600">
            {analytics ? Math.round(
              Object.values(analytics.fieldStats).reduce((acc, stat) => acc + stat.completionRate, 0) / 
              Object.keys(analytics.fieldStats).length
            ) : 0}%
          </p>
        </div>
      </div>

      {/* Liste des réponses */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Dernières Réponses ({responses.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {responses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune réponse pour le moment
            </div>
          ) : (
            <div className="divide-y">
              {responses.map((response, index) => (
                <div key={response.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">
                      Réponse #{responses.length - index}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(response.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(response.response_data).map(([fieldId, value]) => (
                      <div key={fieldId} className="text-sm">
                        <span className="font-medium text-gray-700">
                          {fieldId}:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {value || <em className="text-gray-400">Non renseigné</em>}
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
        <div className="bg-white rounded-lg shadow border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance des Champs
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(analytics.fieldStats).map(([fieldId, stats]) => (
              <div key={fieldId} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-4">
                  {fieldId}
                </span>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
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