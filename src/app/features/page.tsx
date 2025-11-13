import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      category: "Création Intelligente",
      items: [
        {
          icon: "🤖",
          title: "Générateur IA",
          description: "Créez des formulaires en décrivant simplement vos besoins. L'IA génère automatiquement la structure optimale."
        },
        {
          icon: "🎨",
          title: "Drag & Drop",
          description: "Interface intuitive de glisser-déposer pour créer des formulaires complexes sans code."
        },
        {
          icon: "📝",
          title: "Templates Prêts",
          description: "Des dizaines de templates pré-conçus pour les cas d'usage courants."
        }
      ]
    },
    {
      category: "Analytics Avancés",
      items: [
        {
          icon: "📊",
          title: "Dashboard Temps Réel",
          description: "Visualisez les performances de vos formulaires avec des graphiques interactifs."
        },
        {
          icon: "🔍",
          title: "Insights IA",
          description: "Analyse automatique des réponses avec détection de tendances et sentiments."
        },
        {
          icon: "📈",
          title: "Rapports Automatiques",
          description: "Générez des rapports détaillés exportables en PDF et CSV."
        }
      ]
    },
    {
      category: "Intégrations & Partage",
      items: [
        {
          icon: "🔗",
          title: "Liens Publics",
          description: "Partagez vos formulaires avec des liens uniques, accessibles sans compte."
        },
        {
          icon: "📱",
          title: "Responsive Design",
          description: "Formulaires optimisés pour mobile, tablette et desktop."
        },
        {
          icon: "🔄",
          title: "API Complète",
          description: "Intégrez FormFlow dans vos applications avec notre API REST."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Des fonctionnalités
            <span className="text-indigo-600"> puissantes</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Tout ce dont vous avez besoin pour créer, gérer et analyser vos formulaires en un seul endroit.
          </p>
          <Link
            href="/sign-up"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Essayer gratuitement
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {features.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {category.items.map((feature, featureIndex) => (
                  <div key={featureIndex} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des centaines d'entreprises qui utilisent déjà FormFlow AI
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Créer mon compte gratuit
          </Link>
        </div>
      </section>
    </div>
  );
}