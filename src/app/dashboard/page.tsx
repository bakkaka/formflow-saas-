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
        return;
      }

      console.log('🔄 Chargement des formulaires pour l\'utilisateur:', user.id);

      // ✅ Chargement des formulaires
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // ✅ Gestion d'erreur détaillée
      if (formsError) {
        console.error('❌ Erreur Supabase (formulaires):', formsError);
        setError('Erreur lors du chargement des formulaires');
        setForms([]);
        setStats({
          totalForms: 0,
          totalResponses: 0,
          todayResponses: 0
        });
        return;
      }

      console.log('✅ Formulaires chargés:', formsData?.length || 0);

      // ✅ Cas aucun formulaire
      if (!formsData || formsData.length === 0) {
        console.log('📭 Aucun formulaire trouvé pour cet utilisateur');
        setForms([]);
        setStats({
          totalForms: 0,
          totalResponses: 0,
          todayResponses: 0
        });
        return;
      }

      // ✅ Chargement des réponses (optionnel - ne bloque pas si échec)
      let responsesData: any[] = [];
      try {
        const formIds = formsData.map(form => form.id);
        if (formIds.length > 0) {
          const { data: responses, error: responsesError } = await supabase
            .from('form_responses')
            .select('form_id, created_at')
            .in('form_id', formIds)
            .limit(1000);

          if (!responsesError) {
            responsesData = responses || [];
          }
        }
      } catch (responsesError) {
        console.warn('⚠️ Erreur lors du chargement des réponses:', responsesError);
      }

      // ✅ Calcul des statistiques
      const today = new Date().toLocaleDateString('fr-FR');
      const todayCount = responsesData.filter(r => {
        try {
          return new Date(r.created_at).toLocaleDateString('fr-FR') === today;
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

      // ✅ Préparation des données avec compteurs
      const formsWithCounts: Form[] = formsData.map(form => {
        const responseCount = responsesData.filter(r => r.form_id === form.id).length;
        
        return {
          id: form.id,
          title: form.title,
          description: form.description,
          created_at: form.created_at,
          response_count: responseCount,
          has_responses: responseCount > 0,
          last_activity: responseCount > 0 ? 
            new Date(Math.max(...responsesData
              .filter(r => r.form_id === form.id)
              .map(r => new Date(r.created_at).getTime())
            )).toLocaleDateString('fr-FR') 
            : 'Aucune activité'
        };
      });

      // ✅ Tri par activité récente
      formsWithCounts.sort((a, b) => {
        if (a.has_responses && !b.has_responses) return -1;
        if (!a.has_responses && b.has_responses) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setForms(formsWithCounts);

    } catch (error) {
      // ✅ Gestion d'erreur globale
      console.error('💥 Erreur critique chargement dashboard:', error);
      setError('Une erreur est survenue lors du chargement du dashboard');
      setForms([]);
      setStats({
        totalForms: 0,
        totalResponses: 0,
        todayResponses: 0
      });
    } finally {
      // ✅ S'assurer que le loading s'arrête toujours
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadForms();
    }
  }, [user]);

  // ✅ États de chargement et d'erreur
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={loadForms}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ✅ Rendu principal du dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-indigo-600">
              FormFlow AI Dashboard
            </div>
            {/* Votre navigation existante */}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* ✅ Statistiques */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {stats.totalForms}
              </div>
              <div className="text-sm text-gray-600">Formulaires</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.totalResponses}
              </div>
              <div className="text-sm text-gray-600">Réponses Total</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.todayResponses}
              </div>
              <div className="text-sm text-gray-600">Aujourd'hui</div>
            </div>
          </div>
        </div>

        {/* ✅ Liste des formulaires */}
        <div className="px-4">
          {forms.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun formulaire créé
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Créez votre premier formulaire pour commencer à collecter des réponses.
              </p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Créer mon premier formulaire
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => (
                <div key={form.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {form.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {form.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{form.response_count} réponses</span>
                        <span>•</span>
                        <span>Dernière activité: {form.last_activity}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/dashboard/analytics?form=${form.id}`}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-sm hover:bg-indigo-200 transition-colors"
                      >
                        Analytics
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