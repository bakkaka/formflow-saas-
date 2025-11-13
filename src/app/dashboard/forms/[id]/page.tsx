'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Form {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  created_at: string;
}

export default function FormPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formId = params.id as string;

  // Charger le formulaire
  useEffect(() => {
    const loadForm = async () => {
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('id', formId)
          .single();

        if (error) throw error;
        setForm(data);
      } catch (err) {
        setError('Formulaire non trouvé');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  // Générer le lien public
  const publicUrl = `${window.location.origin}/forms/${formId}`;

  // Copier le lien
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Formulaire non trouvé
          </h1>
          <p className="text-gray-600">
            Le formulaire que vous cherchez n'existe pas ou a été supprimé.
          </p>
          <button
            onClick={() => router.push('/dashboard/forms')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retour aux formulaires
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header avec lien de retour */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard/forms')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Retour à Mes Formulaires
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Visualisation du Formulaire</h1>
        </div>

        {/* Section Lien Public */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">
            🌐 Lien Public de Votre Formulaire
          </h2>
          <p className="text-blue-700 mb-4">
            Partagez ce lien avec vos utilisateurs pour qu'ils puissent remplir le formulaire :
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-blue-300 rounded bg-white text-gray-700"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
          <div className="mt-3 flex gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              👁️ Voir la page publique
            </a>
            <span className="text-gray-400">•</span>
            <a
              href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              📘 Partager sur Facebook
            </a>
          </div>
        </div>

        {/* Aperçu du Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {form.title}
          </h2>
          {form.description && (
            <p className="text-gray-600 mb-6">{form.description}</p>
          )}
          
          <div className="space-y-4">
            {form.fields.map((field: any, index: number) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.question}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Votre réponse..."
                    disabled
                  />
                )}
                
                {field.type === 'email' && (
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="email@exemple.com"
                    disabled
                  />
                )}
                
                {field.type === 'textarea' && (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Votre réponse..."
                    disabled
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Informations techniques */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-2">
            ✅ Formulaire sauvegardé dans Supabase
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">ID:</span>
              <p className="font-mono text-gray-800">{form.id}</p>
            </div>
            <div>
              <span className="text-gray-600">Créé le:</span>
              <p className="text-gray-800">
                {new Date(form.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Nombre de champs:</span>
              <p className="text-gray-800">{form.fields.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Champs obligatoires:</span>
              <p className="text-gray-800">
                {form.fields.filter((f: any) => f.required).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}