'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type FormData = {
  id: string;
  title: string;
  fields: any[];
};

type Analytics = {
  totalResponses: number;
  completionRate: number;
  fieldStats: Record<string, any>;
  recentResponses: any[];
};

type AnalysisResult = {
  insights: string[];
  summary: string;
  recommendations: string[];
};

export default function FormAnalyticsPage() {
  const params = useParams();
  const [form, setForm] = useState<FormData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    fetchFormAndAnalytics();
  }, [params.id]);

  const fetchFormAndAnalytics = async () => {
    try {
      // Récupérer le formulaire
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', params.id)
        .single();

      if (formError) throw formError;

      // Récupérer les réponses
      const { data: responsesData, error: responsesError } = await supabase
        .from('form_responses')
        .select('*')
        .eq('form_id', params.id)
        .order('created_at', { ascending: false });

      if (responsesError) throw responsesError;

      // Calculer les analytics
      const analyticsData = calculateAnalytics(formData, responsesData || []);
      
      setForm(formData);
      setAnalytics(analyticsData);
      setResponses(responsesData || []);

      // Lancer l'analyse IA si il y a des réponses
      if (responsesData && responsesData.length > 0) {
        runAIAnalysis(formData, responsesData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // NOUVELLE fonction pour appeler l'API OpenAI via route API
  const analyzeFormResponses = async (responsesData: any[], formData: FormData): Promise<AnalysisResult> => {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: formData.id,
          formTitle: formData.title,
          formFields: formData.fields,
          responses: responsesData
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error('Erreur analyse IA:', error);
      // Fallback en cas d'erreur
      return {
        insights: [
          "🤖 L'analyse IA est temporairement indisponible",
          "📈 " + responsesData.length + " réponses collectées",
          "💡 Réessayez dans quelques instants"
        ],
        summary: "Service d'analyse momentanément interrompu",
        recommendations: [
          "Vérifiez votre connexion internet",
          "Réessayez ultérieurement",
          "Contactez le support si le problème persiste"
        ]
      };
    }
  };

  const runAIAnalysis = async (formData: FormData, responsesData: any[]) => {
    setAnalyzing(true);
    try {
      const analysis = await analyzeFormResponses(responsesData, formData);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Erreur analyse IA:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    if (!form) return;
    await runAIAnalysis(form, responses);
  };

  const calculateAnalytics = (form: FormData, responses: any[]): Analytics => {
    const fieldStats: Record<string, any> = {};

    form.fields.forEach(field => {
      const fieldResponses = responses.map(r => r.response_data[field.id]);
      
      if (field.type === 'select' || field.type === 'radio') {
        // Statistiques pour les choix multiples
        const choices: Record<string, number> = {};
        fieldResponses.forEach(response => {
          if (response) {
            choices[response] = (choices[response] || 0) + 1;
          }
        });
        fieldStats[field.id] = { 
          type: 'choice', 
          data: choices, 
          question: field.question,
          total: responses.length
        };
      
      } else if (field.type === 'checkbox') {
        // Statistiques pour les cases à cocher multiples
        const choices: Record<string, number> = {};
        fieldResponses.forEach(response => {
          if (Array.isArray(response)) {
            response.forEach(choice => {
              choices[choice] = (choices[choice] || 0) + 1;
            });
          } else if (response) {
            choices[response] = (choices[response] || 0) + 1;
          }
        });
        fieldStats[field.id] = { 
          type: 'checkbox', 
          data: choices, 
          question: field.question,
          total: responses.length
        };
      
      } else if (field.type === 'text' || field.type === 'textarea' || field.type === 'email') {
        // Analyse de texte basique
        const nonEmpty = fieldResponses.filter(r => r && r.trim().length > 0);
        const avgLength = nonEmpty.length > 0 
          ? Math.round(nonEmpty.reduce((acc, r) => acc + r.length, 0) / nonEmpty.length)
          : 0;
          
        fieldStats[field.id] = { 
          type: 'text', 
          completion: responses.length > 0 ? (nonEmpty.length / responses.length) * 100 : 0,
          averageLength: avgLength,
          sample: nonEmpty.slice(0, 3),
          question: field.question,
          total: responses.length
        };
      }
    });

    // Calcul du taux de complétion réel
    const completionRate = responses.length > 0 
      ? Math.round((responses.filter(r => {
          const responseData = r.response_data;
          const filledFields = form.fields.filter(field => 
            responseData[field.id] && 
            (Array.isArray(responseData[field.id]) ? responseData[field.id].length > 0 : responseData[field.id].toString().trim().length > 0)
          ).length;
          return filledFields >= form.fields.length * 0.7; // Au moins 70% des champs remplis
        }).length / responses.length) * 100)
      : 0;

    return {
      totalResponses: responses.length,
      completionRate,
      fieldStats,
      recentResponses: responses.slice(0, 5)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (!form || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formulaire non trouvé</h1>
          <Link 
            href="/dashboard/forms"
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
          >
            ← Retour aux formulaires
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Link 
            href={`/dashboard/forms/${form.id}`}
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center text-sm font-medium"
          >
            ← Retour au formulaire
          </Link>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics - {form.title}</h1>
            <p className="text-gray-600 mt-1">{analytics.totalResponses} réponses collectées</p>
          </div>
          <div className="sm:w-24"></div> {/* Spacer pour l'alignement */}
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {analytics.totalResponses}
            </div>
            <div className="text-sm text-gray-600">Réponses totales</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {analytics.completionRate}%
            </div>
            <div className="text-sm text-gray-600">Taux de complétion</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {form.fields.length}
            </div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {analytics.recentResponses.length}
            </div>
            <div className="text-sm text-gray-600">Réponses récentes</div>
          </div>
        </div>

        {/* Section Analyse IA */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Analyse IA Avancée
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Insights intelligents générés par l'IA
              </p>
            </div>
            <button
              onClick={handleRefreshAnalysis}
              disabled={analyzing || responses.length === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Actualiser l'analyse
                </>
              )}
            </button>
          </div>

          {analyzing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">L'IA analyse vos réponses...</p>
              <p className="text-sm text-gray-500 mt-2">Cela peut prendre quelques secondes</p>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-6">
              {/* Insights */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  Insights Clés
                </h3>
                <div className="space-y-3">
                  {aiAnalysis.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-green-500 text-lg mt-0.5">•</span>
                      <span className="text-gray-700 leading-relaxed">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Résumé Exécutif
                </h3>
                <p className="text-gray-700 leading-relaxed bg-white/50 p-4 rounded-lg border border-blue-200/50">
                  {aiAnalysis.summary}
                </p>
              </div>

              {/* Recommandations */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  Recommandations Actionnables
                </h3>
                <div className="space-y-3">
                  {aiAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-orange-500 text-lg mt-0.5">→</span>
                      <span className="text-gray-700 leading-relaxed">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée à analyser</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Partagez votre formulaire pour collecter des réponses et débloquer l'analyse IA avancée.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Prêt pour l'analyse IA</h3>
              <p className="text-gray-600">
                Cliquez sur "Actualiser l'analyse" pour obtenir des insights intelligents sur vos {responses.length} réponses.
              </p>
            </div>
          )}
        </div>

        {/* Analytics par question */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Analyses par Question</h2>
          
          {form.fields.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">❓</div>
              <p className="text-gray-500">Aucune question dans ce formulaire</p>
            </div>
          ) : (
            <div className="space-y-8">
              {form.fields.map(field => {
                const stats = analytics.fieldStats[field.id];
                if (!stats) return null;

                return (
                  <div key={field.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-indigo-500">•</span>
                      {stats.question}
                    </h3>
                    
                    {stats.type === 'choice' && (
                      <div className="space-y-3">
                        {Object.entries(stats.data).map(([choice, count]) => {
                          const percentage = Math.round((Number(count) / stats.total) * 100);
                          return (
                            <div key={choice} className="flex items-center justify-between">
                              <span className="text-gray-700 flex-1">{choice}</span>
                              <div className="flex items-center space-x-4 w-48">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <div className="flex items-center gap-2 w-20 justify-end">
                                  <span className="text-sm font-medium text-gray-700">
                                    {percentage}%
                                  </span>
                                  <span className="text-xs text-gray-500">({String(count)})</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {stats.type === 'checkbox' && (
                      <div className="space-y-3">
                        {Object.entries(stats.data).map(([choice, count]) => {
                          const percentage = Math.round((Number(count) / stats.total) * 100);
                          return (
                            <div key={choice} className="flex items-center justify-between">
                              <span className="text-gray-700 flex-1">{choice}</span>
                              <div className="flex items-center gap-4 w-32 justify-end">
                                <span className="text-sm font-medium text-gray-700">
                                  {percentage}%
                                </span>
                                <span className="text-xs text-gray-500">({count})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {stats.type === 'text' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.completion.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600">Taux de réponse</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.averageLength}</div>
                            <div className="text-sm text-gray-600">Longueur moyenne</div>
                          </div>
                        </div>
                        {stats.sample.length > 0 && (
                          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <span>💬</span>
                              Exemples de réponses:
                            </h4>
                            <div className="space-y-2">
                              {stats.sample.map((sample: string, index: number) => (
                                <p key={index} className="text-sm text-gray-600 bg-white/70 p-3 rounded-lg border border-gray-200/50">
                                  "{sample}"
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Réponses récentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Dernières Réponses
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({analytics.recentResponses.length} sur {analytics.totalResponses})
            </span>
          </h2>
          
          {analytics.recentResponses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500 font-medium">Aucune réponse collectée pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">Partagez votre formulaire pour recevoir des réponses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.recentResponses.map((response, index) => (
                <div key={response.id} className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <span className="text-sm text-gray-500 font-medium">
                      {new Date(response.created_at).toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                      Réponse #{analytics.totalResponses - index}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(response.response_data).map(([key, value]) => (
                      <div key={key} className="bg-gray-50/50 rounded-lg p-3 border border-gray-200/50">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          {key}
                        </div>
                        <div className="text-sm text-gray-700 break-words">
                          {Array.isArray(value) 
                            ? value.length > 0 ? value.join(', ') : 'Aucune sélection'
                            : String(value || 'Non renseigné')
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}