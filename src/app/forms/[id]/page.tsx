'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type FormField = {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  question: string;
  required: boolean;
  options?: string[];
};

type FormData = {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  created_at: string;
};

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [params.id]);

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching form:', error);
        return;
      }

      setForm(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setFormResponses(prev => {
      const currentValues = prev[fieldId] || [];
      
      if (checked) {
        return {
          ...prev,
          [fieldId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [fieldId]: currentValues.filter((item: string) => item !== option)
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    // Validation des champs requis
    const missingRequiredFields = form.fields.filter(field => 
      field.required && (!formResponses[field.id] || 
        (Array.isArray(formResponses[field.id]) && formResponses[field.id].length === 0) ||
        formResponses[field.id] === '')
    );

    if (missingRequiredFields.length > 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('form_responses')
        .insert([
          {
            form_id: form.id,
            response_data: formResponses,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error submitting form:', error);
        alert('Erreur lors de la soumission du formulaire');
        return;
      }

      setSubmitSuccess(true);
      setFormResponses({});
      
      // ✅ REDIRECTION VERS UNE PAGE RÉELLE
      setTimeout(() => {
        // Option 1: Rediriger vers la page d'accueil
        router.push('/');
        
        // Option 2: Rediriger vers une page de remerciement spécifique
        // router.push('/thank-you');
        
        // Option 3: Rediriger vers le tableau de bord
        // router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      alert('Erreur inattendue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formulaire non trouvé</h1>
          <p className="text-gray-600">Le formulaire que vous recherchez n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Merci !</h1>
          <p className="text-gray-600 mb-2">Votre réponse a été enregistrée avec succès.</p>
          <p className="text-gray-500 text-sm mb-6">
            Redirection automatique dans 2 secondes...
          </p>
          
          <div className="animate-pulse">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/')}
            className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Retour à l'accueil maintenant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* En-tête du formulaire */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600">{form.description}</p>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields.map((field) => (
            <div key={field.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {field.question}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Champ Texte */}
              {field.type === 'text' && (
                <input
                  type="text"
                  value={formResponses[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required={field.required}
                />
              )}

              {/* Champ Email */}
              {field.type === 'email' && (
                <input
                  type="email"
                  value={formResponses[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required={field.required}
                />
              )}

              {/* Zone de texte */}
              {field.type === 'textarea' && (
                <textarea
                  value={formResponses[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required={field.required}
                />
              )}

              {/* Menu déroulant */}
              {field.type === 'select' && (
                <select
                  value={formResponses[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required={field.required}
                >
                  <option value="">Sélectionnez une option</option>
                  {field.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* Boutons radio */}
              {field.type === 'radio' && (
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name={field.id}
                        value={option}
                        checked={formResponses[field.id] === option}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="mr-3 text-indigo-600 focus:ring-indigo-500"
                        required={field.required}
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Cases à cocher */}
              {field.type === 'checkbox' && (
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        value={option}
                        checked={(formResponses[field.id] || []).includes(option)}
                        onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                        className="mr-3 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Bouton de soumission */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                'Soumettre le formulaire'
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              * Champs obligatoires
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}