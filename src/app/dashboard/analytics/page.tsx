import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default async function AnalyticsPage() {
  // Récupérer tous les formulaires avec stats
  const { data: forms, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur chargement analytics:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600">
            Impossible de charger les données analytics
          </p>
        </div>
      </div>
    );
  }

  // Calculer les statistiques
  const totalForms = forms?.length || 0;
  const totalFields = forms?.reduce((total, form) => total + (form.fields?.length || 0), 0) || 0;
  const requiredFields = forms?.reduce((total, form) => 
    total + (form.fields?.filter(field => field.required)?.length || 0), 0) || 0;
  
  // Formulaires créés cette semaine
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentForms = forms?.filter(form => new Date(form.created_at) > oneWeekAgo).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link 
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-800 mb-2 inline-block"
            >
              ← Retour au Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">
              Statistiques et performances de vos formulaires
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Mis à jour à l'instant
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Formulaires</h3>
                <p className="text-3xl font-bold text-blue-600">{totalForms}</p>
                <p className="text-gray-600 text-sm">Total créés</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Champs</h3>
                <p className="text-3xl font-bold text-green-600">{totalFields}</p>
                <p className="text-gray-600 text-sm">Total champs</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">⭐</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Obligatoires</h3>
                <p className="text-3xl font-bold text-orange-600">{requiredFields}</p>
                <p className="text-gray-600 text-sm">Champs requis</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Récents</h3>
                <p className="text-3xl font-bold text-purple-600">{recentForms}</p>
                <p className="text-gray-600 text-sm">7 derniers jours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Types de champs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Répartition des Types de Champs</h2>
            <div className="space-y-4">
              {forms && forms.length > 0 ? (
                <>
                  {Object.entries(
                    forms.reduce((acc, form) => {
                      form.fields?.forEach(field => {
                        acc[field.type] = (acc[field.type] || 0) + 1;
                      });
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-gray-700 capitalize">{type}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${(count / totalFields) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
              )}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Activité Récente</h2>
            <div className="space-y-4">
              {forms && forms.slice(0, 5).map((form) => (
                <div key={form.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">{form.title}</p>
                    <p className="text-sm text-gray-500">
                      {form.fields?.length} champs • 
                      Créé le {new Date(form.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/forms/${form.id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Voir
                  </Link>
                </div>
              ))}
              {(!forms || forms.length === 0) && (
                <p className="text-gray-500 text-center py-8">Aucune activité récente</p>
              )}
            </div>
          </div>
        </div>

        {/* Tableau détaillé */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tous les Formulaires</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Titre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Champs</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Obligatoires</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms?.map((form) => (
                  <tr key={form.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{form.title}</p>
                      {form.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {form.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                        {form.fields?.length || 0} champs
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded">
                        {form.fields?.filter(f => f.required).length || 0} requis
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(form.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!forms || forms.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Aucun formulaire à afficher
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}