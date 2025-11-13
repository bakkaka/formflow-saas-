'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type FormField = {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  question: string;
  required: boolean;
  options?: string[];
};

export default function NewFormPage() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const addField = (type: FormField['type']) => {
    const baseField: FormField = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      question: getDefaultQuestion(type, fields.length + 1),
      required: false,
    };

    // Configuration des options selon le type
    if (type === 'select' || type === 'radio') {
      baseField.options = ['Option 1', 'Option 2'];
    } else if (type === 'checkbox') {
      baseField.options = ['Option 1'];
    }

    setFields([...fields, baseField]);
  };

  const getDefaultQuestion = (type: FormField['type'], index: number): string => {
    const questions: Record<FormField['type'], string> = {
      text: `Question ${index} (texte)`,
      email: `Quel est votre email ?`,
      number: `Question ${index} (nombre)`,
      textarea: `Décrivez votre expérience...`,
      select: `Choisissez une option`,
      radio: `Sélectionnez une option`,
      checkbox: `Sélectionnez les options appropriées`
    };
    return questions[type];
  };

  const getFieldTypeLabel = (type: FormField['type']): string => {
    const labels: Record<FormField['type'], string> = {
      text: 'Texte court',
      email: 'Email',
      number: 'Nombre',
      textarea: 'Zone de texte',
      select: 'Menu déroulant',
      radio: 'Boutons radio',
      checkbox: 'Cases à cocher'
    };
    return labels[type];
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field?.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldId, { options: newOptions });
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const currentOptions = field.options || [];
    const newOption = `Option ${currentOptions.length + 1}`;
    updateField(fieldId, { options: [...currentOptions, newOption] });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field?.options) return;

    const newOptions = field.options.filter((_, i) => i !== optionIndex);
    updateField(fieldId, { options: newOptions.length > 0 ? newOptions : undefined });
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    // Simulation IA avec un formulaire de satisfaction complet
    setTimeout(() => {
      setFields([
        {
          id: '1',
          type: 'text',
          question: 'Quel est votre nom ?',
          required: true,
        },
        {
          id: '2',
          type: 'email',
          question: 'Votre adresse email',
          required: true,
        },
        {
          id: '3',
          type: 'select',
          question: 'Quel est votre niveau de satisfaction ?',
          required: true,
          options: ['Très satisfait', 'Satisfait', 'Neutre', 'Insatisfait', 'Très insatisfait']
        },
        {
          id: '4',
          type: 'radio',
          question: 'Recommanderiez-vous notre service ?',
          required: true,
          options: ['Oui', 'Non', 'Peut-être']
        },
        {
          id: '5',
          type: 'checkbox',
          question: 'Quels produits avez-vous utilisés ?',
          required: false,
          options: ['Produit A', 'Produit B', 'Produit C', 'Formation']
        },
        {
          id: '6',
          type: 'textarea',
          question: 'Avez-vous des commentaires supplémentaires ?',
          required: false,
        },
      ]);
      setFormTitle('Formulaire de Satisfaction Client');
      setFormDescription('Aidez-nous à améliorer nos services en partageant votre expérience');
      setIsGenerating(false);
    }, 1500);
  };

  const handleCreateForm = async () => {
    try {
      setIsCreating(true);
      
      if (!formTitle.trim()) {
        alert('Veuillez ajouter un titre pour votre formulaire');
        return;
      }

      if (fields.length === 0) {
        alert('Veuillez ajouter au moins un champ à votre formulaire');
        return;
      }

      const emptyFields = fields.filter(field => !field.question.trim());
      if (emptyFields.length > 0) {
        alert('Veuillez remplir les questions pour tous les champs');
        return;
      }

      // Vérifier les options pour les champs qui en nécessitent
      const fieldsWithMissingOptions = fields.filter(field => 
        (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && 
        (!field.options || field.options.length === 0)
      );

      if (fieldsWithMissingOptions.length > 0) {
        alert('Veuillez ajouter des options pour les menus déroulants, boutons radio et cases à cocher');
        return;
      }

      console.log('📤 Création du formulaire:', {
        title: formTitle,
        description: formDescription,
        fields: fields,
        fieldsCount: fields.length
      });

      const { data, error } = await supabase
        .from('forms')
        .insert([
          {
            title: formTitle,
            description: formDescription,
            fields: fields,
            user_id: 'user-manuel'
          }
        ])
        .select();

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        alert(`Erreur: ${error.message}`);
        return;
      }

      console.log('✅ Formulaire créé:', data);

      if (data && data[0]) {
        router.push(`/dashboard/forms/${data[0].id}`);
      }
      
    } catch (error) {
      console.error('💥 Erreur création formulaire:', error);
      alert('Erreur inattendue lors de la création du formulaire');
    } finally {
      setIsCreating(false);
    }
  };

  const canCreateForm = formTitle.trim() && 
                       fields.length > 0 && 
                       !fields.some(field => !field.question.trim()) &&
                       !fields.some(field => 
                         (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && 
                         (!field.options || field.options.length === 0)
                       );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/dashboard"
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Retour au Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Créer un Formulaire</h1>
        </div>
        
        {/* Section Titre et Description */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du Formulaire *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ex: Sondage de Satisfaction Client"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Décrivez l'objectif de ce formulaire..."
              />
            </div>
          </div>
        </div>

        {/* Section IA */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2 text-lg">
            🚀 Générateur IA
          </h3>
          <p className="text-blue-700 mb-4">
            Générez automatiquement un formulaire de satisfaction complet !
          </p>
          <button
            onClick={generateWithAI}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full md:w-auto"
          >
            {isGenerating ? '🔄 Génération en cours...' : '✨ Générer un formulaire de satisfaction'}
          </button>
        </div>

        {/* Section Champs du Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Champs du Formulaire</h2>
              <p className="text-sm text-gray-600 mt-1">
                {fields.length} champ(s) ajouté(s)
              </p>
            </div>
            
            {/* Boutons d'ajout de champs */}
            <div className="flex flex-wrap gap-2">
              {([
                { type: 'text', label: 'Texte', color: 'gray' },
                { type: 'email', label: 'Email', color: 'gray' },
                { type: 'textarea', label: 'Zone texte', color: 'gray' },
                { type: 'select', label: 'Menu déroulant', color: 'blue' },
                { type: 'radio', label: 'Boutons radio', color: 'green' },
                { type: 'checkbox', label: 'Cases à cocher', color: 'purple' },
              ] as const).map(({ type, label, color }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className={`
                    px-3 py-2 rounded text-sm font-medium transition-colors
                    ${color === 'gray' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                    ${color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    ${color === 'green' ? 'bg-green-600 hover:bg-green-700' : ''}
                    ${color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    text-white
                  `}
                >
                  + {label}
                </button>
              ))}
            </div>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-lg mb-2">Aucun champ ajouté</p>
              <p className="text-sm">Ajoutez des champs ou utilisez le générateur IA</p>
            </div>
          ) : (
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-sm transition-shadow">
                  {/* En-tête du champ */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {getFieldTypeLabel(field.type)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">Champ {index + 1}</span>
                    </div>
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                  
                  {/* Question */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={field.question}
                      onChange={(e) => updateField(field.id, { question: e.target.value })}
                      placeholder="Entrez la question à poser..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  {/* Options pour select, radio, checkbox */}
                  {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Options {field.type === 'checkbox' ? '(cases à cocher multiples)' : '(choix unique)'} *
                      </label>
                      
                      <div className="space-y-2">
                        {field.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 w-6">{optionIndex + 1}.</span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(field.id, optionIndex)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Supprimer cette option"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => addOption(field.id)}
                        className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        + Ajouter une option
                      </button>
                    </div>
                  )}
                  
                  {/* Option obligatoire */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                      className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700 font-medium">
                      Champ obligatoire
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1">
            {!formTitle.trim() && (
              <p className="text-red-600 text-sm">⚠️ Le titre du formulaire est requis</p>
            )}
            {fields.some(field => !field.question.trim()) && (
              <p className="text-red-600 text-sm">⚠️ Veuillez remplir toutes les questions</p>
            )}
            {fields.some(field => 
              (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && 
              (!field.options || field.options.length === 0)
            ) && (
              <p className="text-red-600 text-sm">⚠️ Certains champs nécessitent des options</p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateForm}
              disabled={!canCreateForm || isCreating}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isCreating ? '🔄 Création...' : '📝 Créer le Formulaire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}