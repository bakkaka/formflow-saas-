'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Form {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  created_at: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Charger les formulaires
  useEffect(() => {
    const loadForms = async () => {
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setForms(data || []);
      } catch (err) {
        setError('Erreur lors du chargement des formulaires');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, []);

  // Copier le lien public
  const copyToClipboard = async (formId: string) => {
    const publicUrl = `${window.location.origin}/forms/${formId}`;
    await navigator.clipboard.writeText(publicUrl);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des formulaires...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Calculer les statistiques
  const totalForms = forms.length;
  const totalFields = forms.reduce((total, form) => total + (form.fields?.length || 0), 0);
  const recentForms = forms.filter(form => {
    const formDate = new Date(form.created_at);
    const today = new Date();
    return formDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link 
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
            >
              ← Retour au Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Mes Formulaires</h1>
            <p className="text-gray-600 mt-2">
              Gérez et visualisez tous vos formulaires créés
            </p>
          </div>
          <Link
            href="/dashboard/forms/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            + Nouveau Formulaire
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total</h3>
            <p className="text-3xl font-bold text-indigo-600">{totalForms}</p>
            <p className="text-gray-600 text-sm">Formulaires créés</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Récents</h3>
            <p className="text-3xl font-bold text-green-600">{recentForms}</p>
            <p className="text-gray-600 text-sm">Aujourd'hui</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Champs</h3>
            <p className="text-3xl font-bold text-blue-600">{totalFields}</p>
            <p className="text-gray-600 text-sm">Champs total</p>
          </div>
        </div>

        {/* Liste des formulaires */}
        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Aucun formulaire créé
              </h2>
              <p className="text-gray-600 mb-6">
                Commencez par créer votre premier formulaire pour le voir apparaître ici.
              </p>
              <Link
                href="/dashboard/forms/new"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 inline-block"
              >
                Créer mon premier formulaire
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => {
              const publicUrl = `${window.location.origin}/forms/${form.id}`;
              
              return (
                <div key={form.id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                      {form.title}
                    </h3>
                    
                    {form.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {form.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>{form.fields?.length || 0} champs</span>
                      <span>
                        {new Date(form.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {/* Section Lien Public */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-xs font-medium mb-1">Lien Public :</p>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={publicUrl}
                          readOnly
                          className="flex-1 text-xs px-2 py-1 border border-blue-300 rounded bg-white truncate"
                        />
                        <button
                          onClick={() => copyToClipboard(form.id)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 whitespace-nowrap min-w-[60px]"
                        >
                          {copiedId === form.id ? '✓' : 'Copier'}
                        </button>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          👁️ Voir
                        </a>
                        <a
                          href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          📘 Partager
                        </a>
                      </div>
                    </div>

                    {/* BOUTONS D'ACTION - AVEC ANALYTICS */}
                    <div className="flex gap-2">
                      {/* BOUTON ANALYTICS */}
                      <Link
                        href={`/dashboard/forms/${form.id}/analytics`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        📊 Analytics
                      </Link>
                      
                      {/* BOUTON DÉTAILS */}
                      <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="flex-1 bg-indigo-600 text-white text-center py-2 rounded text-sm hover:bg-indigo-700 transition-colors"
                      >
                        Détails
                      </Link>
                      
                      {/* BOUTON OPTIONS */}
                      <button className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors">
                        ⋮
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}