'use client';

import { useState, useEffect } from 'react';
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { supabase } from '@/lib/supabase';

interface Form {
  id: string;
  title: string;
  description: string;
  created_at: string;
  response_count?: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    todayResponses: 0
  });

  useEffect(() => {
    if (user) {
      loadForms();
    }
  }, [user]);

  const loadForms = async () => {
    try {
      // Charger les formulaires
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (formsError) throw formsError;

      // Charger les stats de réponses
      const { data: responsesData, error: responsesError } = await supabase
        .from('form_responses')
        .select('form_id, created_at')
        .in('form_id', formsData?.map(f => f.id) || []);

      if (responsesError) throw responsesError;

      // Calculer les stats
      const today = new Date().toLocaleDateString('fr-FR');
      const todayCount = responsesData?.filter(r => 
        new Date(r.created_at).toLocaleDateString('fr-FR') === today
      ).length || 0;

      setStats({
        totalForms: formsData?.length || 0,
        totalResponses: responsesData?.length || 0,
        todayResponses: todayCount
      });

      // Ajouter le compteur de réponses à chaque formulaire
      const formsWithCounts = formsData?.map(form => ({
        ...form,
        response_count: responsesData?.filter(r => r.form_id === form.id).length || 0
      })) || [];

      setForms(formsWithCounts);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="font-bold text-xl text-indigo-600">
                FormFlow AI
              </div>
              <div className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1">
                  Dashboard
                </Link>
                <Link href="/dashboard/forms" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Mes Formulaires
                </Link>
                <Link href="/dashboard/analytics" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Analytics
                </Link>
              </div>
            </div>
            <UserButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* KPI Cards */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Forms */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Formulaires</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalForms}</p>
                </div>
              </div>
            </div>

            {/* Total Responses */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Réponses Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
                </div>
              </div>
            </div>

            {/* Today's Responses */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayResponses}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Create Form Card */}
              <Link 
                href="/dashboard/forms/new"
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">✨</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Créer un Formulaire</h3>
                  <p className="text-gray-600 text-sm">
                    Générez un nouveau formulaire avec IA
                  </p>
                </div>
              </Link>

              {/* My Forms Card */}
              <Link 
                href="/dashboard/forms"
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Mes Formulaires</h3>
                  <p className="text-gray-600 text-sm">
                    Gérer vos formulaires existants
                  </p>
                </div>
              </Link>

              {/* Analytics Card */}
              <Link 
                href="/dashboard/analytics"
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📈</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">Analytics</h3>
                  <p className="text-gray-600 text-sm">
                    Voir les performances détaillées
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Forms */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Formulaires Récents</h2>
            </div>
            
            {forms.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun formulaire créé
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Créez votre premier formulaire pour commencer à collecter des réponses et analyser vos données.
                </p>
                <Link 
                  href="/dashboard/forms/new"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium inline-block"
                >
                  Créer mon premier formulaire
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {forms.slice(0, 5).map((form) => (
                  <div key={form.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{form.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{form.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Créé le {new Date(form.created_at).toLocaleDateString('fr-FR')}</span>
                          <span>•</span>
                          <span>{form.response_count || 0} réponses</span>
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

            {forms.length > 5 && (
              <div className="p-4 border-t border-gray-200 text-center">
                <Link 
                  href="/dashboard/forms"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Voir tous les formulaires ({forms.length})
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}