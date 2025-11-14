'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Form {
  id: string;
  title: string;
  description: string;
  created_at: string;
  response_count: number;
  has_responses: boolean;
  last_activity: string;
}

interface DashboardStats {
  totalForms: number;
  totalResponses: number;
  todayResponses: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [forms, setForms] = useState<Form[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalForms: 0,
    totalResponses: 0,
    todayResponses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForms = async () => {
    try {
      console.log('🚀 Début du chargement des formulaires');
      
      // ✅ Réinitialiser les états
      setError(null);
      setLoading(true);

      // ✅ Vérification robuste de l'utilisateur
      if (!user || !user.id) {
        console.warn('🔐 Utilisateur non authentifié ou ID manquant');
        setForms([]);
        setStats({
          totalForms: 0,
          totalResponses: 0,
          todayResponses: 0
        });
        setLoading(false);
        return;
      }

      console.log('🔄 Chargement des formulaires pour l\'utilisateur:', user.id);

      // ✅ APPROCHE COMPLÈTEMENT DIFFÉRENTE : Utiliser try/catch autour de la requête
      let formsData: any[] = [];
      let hasError = false;
      
      try {
        const result = await supabase
          .from('forms')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.log('📋 Résultat complet Supabase:', result);

        // ✅ VÉRIFICATION NOUVELLE : Vérifier si l'objet error existe et a du contenu
        if (result.error) {
          // Vérifier si l'erreur n'est pas un objet vide
          if (Object.keys(result.error).length > 0) {
            console.error('❌ Erreur Supabase structurée:', result.error);
            setError(`Erreur Supabase: ${result.error.message || 'Erreur inconnue'}`);
            hasError = true;
          } else {
            console.log('ℹ️  Erreur objet vide détectée, continuation normale');
            // Continuer sans erreur si l'objet error est vide
          }
        }

        if (!hasError && result.data) {
          formsData = result.data;
        }
      } catch (supabaseError: any) {
        console.error('💥 Erreur lors de l\'appel Supabase:', supabaseError);
        setError(`Erreur de connexion: ${supabaseError.message || 'Impossible de se connecter à la base de données'}`);
        hasError = true;
      }

      // ✅ Si erreur, arrêter ici
      if (hasError) {
        setForms([]);
        setStats({
          totalForms: 0,
          totalResponses: 0,
          todayResponses: 0
        });
        setLoading(false);
        return;
      }

      console.log('✅ Données formulaires récupérées:', formsData.length);

      // ✅ Cas aucun formulaire
      if (!formsData || formsData.length === 0) {
        console.log('📭 Aucun formulaire trouvé pour cet utilisateur');
        setForms([]);
        setStats({
          totalForms: 0,
          totalResponses: 0,
          todayResponses: 0
        });
        setLoading(false);
        return;
      }

      // ✅ Chargement des réponses
      let responsesData: any[] = [];
      const formIds = formsData.map(form => form.id);
      
      if (formIds.length > 0) {
        try {
          console.log('📥 Chargement des réponses pour', formIds.length, 'formulaires');
          const responseResult = await supabase
            .from('form_responses')
            .select('form_id, created_at')
            .in('form_id', formIds);

          if (responseResult.error && Object.keys(responseResult.error).length > 0) {
            console.warn('⚠️ Erreur réponses:', responseResult.error);
          } else {
            responsesData = responseResult.data || [];
            console.log('📊 Réponses chargées:', responsesData.length);
          }
        } catch (responsesError) {
          console.warn('⚠️ Exception réponses:', responsesError);
        }
      }

      // ✅ Calcul des statistiques
      const today = new Date().toDateString();
      const todayCount = responsesData.filter(r => {
        try {
          if (!r.created_at) return false;
          const responseDate = new Date(r.created_at);
          return responseDate.toDateString() === today;
        } catch {
          return false;
        }
      }).length;

      // ✅ Mise à jour des stats
      setStats({
        totalForms: formsData.length,
        totalResponses: responsesData.length,
        todayResponses: todayCount
      });

      // ✅ Préparation des données
      const formsWithCounts: Form[] = formsData.map(form => {
        const formResponses = responsesData.filter(r => r.form_id === form.id);
        const responseCount = formResponses.length;
        
        let lastActivity = 'Aucune activité';
        if (responseCount > 0) {
          try {
            const timestamps = formResponses
              .filter(r => r.created_at)
              .map(r => new Date(r.created_at).getTime());
            
            if (timestamps.length > 0) {
              const latestDate = new Date(Math.max(...timestamps));
              lastActivity = latestDate.toLocaleDateString('fr-FR');
            }
          } catch (dateError) {
            console.warn('Erreur de date pour le formulaire:', form.id);
          }
        }

        return {
          id: form.id,
          title: form.title || 'Sans titre',
          description: form.description || 'Aucune description',
          created_at: form.created_at,
          response_count: responseCount,
          has_responses: responseCount > 0,
          last_activity: lastActivity
        };
      });

      // ✅ Tri des formulaires
      const sortedForms = [...formsWithCounts].sort((a, b) => {
        if (a.has_responses && !b.has_responses) return -1;
        if (!a.has_responses && b.has_responses) return 1;
        
        try {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        } catch {
          return 0;
        }
      });

      setForms(sortedForms);

    } catch (error: any) {
      // ✅ Gestion d'erreur globale
      console.error('💥 Erreur critique dans loadForms:', error);
      setError(`Erreur inattendue: ${error.message || 'Veuillez réessayer'}`);
      setForms([]);
      setStats({
        totalForms: 0,
        totalResponses: 0,
        todayResponses: 0
      });
    } finally {
      // ✅ Toujours arrêter le loading
      console.log('🏁 Chargement terminé');
      setLoading(false);
    }
  };

  // ✅ Version ultra-simplifiée pour debug
  const loadFormsSimple = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setForms([]);
        return;
      }

      // ✅ Test minimaliste
      const { data, error: sbError } = await supabase
        .from('forms')
        .select('id, title')
        .eq('user_id', user.id)
        .limit(5);

      console.log('🧪 Test minimaliste:', { data, sbError });

      if (data) {
        const simpleForms: Form[] = data.map(item => ({
          id: item.id,
          title: item.title || 'Sans titre',
          description: 'Description',
          created_at: new Date().toISOString(),
          response_count: 0,
          has_responses: false,
          last_activity: 'Aucune activité'
        }));
        setForms(simpleForms);
        setStats({
          totalForms: simpleForms.length,
          totalResponses: 0,
          todayResponses: 0
        });
      }

    } catch (err: any) {
      console.error('💥 Erreur test simple:', err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🎯 useEffect déclenché, user:', user?.id);
    if (user) {
      // Utiliser la version simple pour debug
      loadFormsSimple();
    } else {
      setLoading(false);
    }
  }, [user]);

  // ✅ États de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ Affichage des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <div className="text-red-600 text-lg font-semibold mb-2">Erreur</div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={loadFormsSimple}
                className="w-full bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Réessayer (version simple)
              </button>
              <button
                onClick={loadForms}
                className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Réessayer (version complète)
              </button>
            </div>
          </div>
          <details className="text-left text-sm text-gray-600">
            <summary className="cursor-pointer mb-2">Détails techniques</summary>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono">
              User ID: {user?.id || 'Non connecté'}<br/>
              Time: {new Date().toLocaleTimeString()}
            </div>
          </details>
        </div>
      </div>
    );
  }

  // ✅ Rendu principal
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-indigo-600">
              FormFlow AI
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bonjour, {user?.firstName || user?.username || 'Utilisateur'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* ✅ Statistiques */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {stats.totalForms}
              </div>
              <div className="text-sm text-gray-600 font-medium">Formulaires</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.totalResponses}
              </div>
              <div className="text-sm text-gray-600 font-medium">Réponses Total</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.todayResponses}
              </div>
              <div className="text-sm text-gray-600 font-medium">Aujourd'hui</div>
            </div>
          </div>
        </div>

        {/* ✅ En-tête */}
        <div className="px-4 mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Mes Formulaires</h2>
          <Link
            href="/dashboard/forms/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            + Nouveau Formulaire
          </Link>
        </div>

        {/* ✅ Liste des formulaires */}
        <div className="px-4">
          {forms.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Commencez par créer un formulaire
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                Créez votre premier formulaire pour collecter des réponses et analyser vos données.
              </p>
              <Link
                href="/dashboard/forms/new"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg shadow-sm inline-block"
              >
                Créer mon premier formulaire
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {forms.map((form) => (
                <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {form.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {form.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          form.response_count > 0 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {form.response_count} {form.response_count === 1 ? 'réponse' : 'réponses'}
                        </span>
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                          Dernière activité: {form.last_activity}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3 ml-6">
                      <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors font-medium border border-gray-200"
                      >
                        📊 Voir
                      </Link>
                    </div>
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