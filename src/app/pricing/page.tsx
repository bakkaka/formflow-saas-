'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useStripe } from '@/components/StripeProvider';
import Link from 'next/link';

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const { stripe, loading: stripeLoading } = useStripe();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Parfait pour commencer et tester la plateforme',
      features: [
        '3 formulaires actifs maximum',
        '100 réponses/mois incluses',
        'Analytics basiques',
        'Support email prioritaire',
        'Export des données basique',
        'Pages publiques illimitées'
      ],
      cta: 'Commencer gratuitement',
      popular: false,
      priceId: null,
      badge: null
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '$19',
      period: '/month',
      description: 'Idéal pour les freelances et petites équipes',
      features: [
        'Formulaires illimités',
        '1,000 réponses/mois incluses',
        'Analytics avancés avec graphiques',
        'Export CSV et PDF',
        'Sans marque FormFlow',
        'Templates premium',
        'Support chat + email',
        'Webhooks basiques'
      ],
      cta: 'Essayer 14 jours gratuits',
      popular: true,
      priceId: 'price_1Pq9a2P8wM5C6qLd4Kp8a9bC',
      badge: 'Plus populaire'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$49',
      period: '/month',
      description: 'Pour les entreprises en croissance',
      features: [
        '5,000 réponses/mois incluses',
        'White-labeling complet',
        'API accès complet',
        'Analytics temps réel',
        'Support téléphonique prioritaire',
        'Collaboration équipe (3 users)',
        'Webhooks avancés',
        'SLA 99.9% garantie',
        'Intégrations personnalisées'
      ],
      cta: 'Démarrer l\'essai gratuit',
      popular: false,
      priceId: 'price_1Pq9a2P8wM5C6qLd5Lp9b0cD',
      badge: 'Recommandé'
    }
  ];

  const handleSubscription = async (plan: typeof plans[0]) => {
    if (!plan.priceId) {
      window.location.href = isSignedIn ? '/dashboard' : '/sign-up';
      return;
    }

    if (stripeLoading) {
      alert('Stripe est en cours de chargement. Veuillez patienter...');
      return;
    }

    if (!stripe) {
      alert('Système de paiement temporairement indisponible. Veuillez réessayer plus tard.');
      return;
    }

    if (!isSignedIn) {
      window.location.href = '/sign-up';
      return;
    }

    setLoading(plan.id);

    try {
      console.log('Starting checkout for plan:', plan.name);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }

      const { sessionId, url } = await response.json();

      console.log('Redirecting to Stripe checkout with session:', sessionId);

      if (url) {
        window.location.href = url;
      } else {
        console.warn('Using legacy Stripe redirect method');
        const { error } = await (stripe as any).redirectToCheckout({
          sessionId,
        });

        if (error) {
          console.error('Stripe redirect error:', error);
          alert(`Erreur de paiement: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Checkout process error:', error);
      alert('Erreur lors du processus de paiement. Veuillez réessayer ou contacter le support.');
    } finally {
      setLoading(null);
    }
  };

  if (stripeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des options de paiement...</p>
          <p className="text-gray-500 text-sm mt-2">Préparation de votre expérience sécurisée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
            🎯 Paiements 100% sécurisés avec Stripe
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Des prix <span className="text-indigo-600">transparents</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choisissez le plan qui correspond à vos besoins. Tous les plans payants incluent un essai gratuit de 14 jours.
          </p>
          
          {!stripe && !stripeLoading && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <p className="text-yellow-800 text-sm">
                  Les paiements sont temporairement en maintenance. Fonctionnalités gratuites disponibles.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-20 transform scale-105' 
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    plan.popular 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="p-8 h-full flex flex-col">
                <div className="text-center mb-8 flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <button
                    onClick={() => handleSubscription(plan)}
                    disabled={!!(loading === plan.id || (!stripe && plan.priceId))} {/* ✅ CORRIGÉ ICI */}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 shadow hover:shadow-md'
                    } ${(loading === plan.id || (!stripe && plan.priceId)) ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Traitement...
                      </div>
                    ) : !stripe && plan.priceId ? (
                      'Indisponible'
                    ) : (
                      plan.cta
                    )}
                  </button>
                  
                  {plan.priceId && (
                    <p className="text-center text-gray-500 text-xs mt-3">
                      🔒 Paiement sécurisé • Annulation à tout moment
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Besoins d'entreprise ?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Pour les grandes organisations avec des besoins spécifiques en matière de volume, sécurité et intégrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
              >
                Contactez les ventes
              </Link>
              <div className="text-sm text-gray-500">
                ✉️ contact@formflow.ai • 📞 +1 (555) 123-4567
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Questions fréquentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Comment fonctionne l'essai gratuit de 14 jours ?",
                answer: "Tous les plans payants incluent un essai gratuit complet de 14 jours. Aucune carte de crédit requise pour commencer. Vous pouvez annuler à tout moment pendant la période d'essai sans être facturé."
              },
              {
                question: "Puis-je changer de plan à tout moment ?",
                answer: "Absolument ! Vous pouvez améliorer ou réduire votre plan à tout moment. Les changements prennent effet immédiatement, et nous ajusterons votre facturation de manière proportionnelle."
              },
              {
                question: "Que se passe-t-il si je dépasse mes limites ?",
                answer: "Nous vous enverrons des notifications par email à l'approche de vos limites. Vous pourrez soit mettre à niveau votre plan, soit archiver d'anciens formulaires pour libérer de l'espace."
              },
              {
                question: "Quels modes de paiement acceptez-vous ?",
                answer: "Nous acceptons toutes les cartes de crédit et de débit principales (Visa, Mastercard, American Express) via Stripe. Tous les paiements sont cryptés et sécurisés."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {faq.question}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm mb-6">Paiements 100% sécurisés avec</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl">🔒</div>
            <div className="text-gray-400 font-mono text-sm">Stripe</div>
            <div className="text-2xl">🛡️</div>
            <div className="text-gray-400 font-mono text-sm">SSL</div>
            <div className="text-2xl">💰</div>
            <div className="text-gray-400 font-mono text-sm">PCI DSS</div>
          </div>
        </div>
      </div>
    </div>
  );
}