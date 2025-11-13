import Link from 'next/link';
import { SignedOut, SignedIn } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Créez des formulaires
              <span className="text-indigo-600"> intelligents</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Générez, analysez et optimisez vos formulaires avec l'IA. 
              <span className="font-semibold"> 10x plus rapide</span>, des insights 
              <span className="font-semibold"> 10x plus pertinents</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <Link
                  href="/sign-up"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  href="/pricing"
                  className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white transition-colors"
                >
                  Voir les tarifs
                </Link>
              </SignedOut>
              
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Aller au Dashboard
                </Link>
              </SignedIn>
            </div>
            
            <p className="text-gray-500 mt-4 text-sm">
              Essai gratuit de 14 jours • Aucune carte de crédit requise
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir FormFlow AI ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La plateforme complète pour tous vos besoins en formulaires
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Génération IA
              </h3>
              <p className="text-gray-600">
                Créez des formulaires en quelques secondes avec notre IA avancée
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analytics Avancés
              </h3>
              <p className="text-gray-600">
                Obtenez des insights intelligents sur les réponses de vos formulaires
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Performance Maximale
              </h3>
              <p className="text-gray-600">
                Interface ultra-rapide et expérience utilisateur optimisée
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à révolutionner vos formulaires ?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Rejoignez des centaines d'entreprises qui utilisent déjà FormFlow AI
          </p>
          <Link
            href="/sign-up"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Commencer gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}