import Link from 'next/link';

export default function TemplatesPage() {
  const templates = [
    {
      category: "Marketing",
      items: [
        {
          title: "Sondage Satisfaction Client",
          description: "Collectez des feedbacks clients pour améliorer vos services",
          responses: "120+ utilisations",
          icon: "⭐"
        },
        {
          title: "Formulaire de Contact",
          description: "Page de contact professionnelle pour votre site web",
          responses: "450+ utilisations", 
          icon: "📞"
        },
        {
          title: "Inscription Newsletter",
          description: "Augmentez votre liste email avec un formulaire optimisé",
          responses: "890+ utilisations",
          icon: "✉️"
        }
      ]
    },
    {
      category: "RH & Recrutement",
      items: [
        {
          title: "Candidature Spontanée",
          description: "Formulaire de recrutement avec CV et lettre de motivation",
          responses: "340+ utilisations",
          icon: "💼"
        },
        {
          title: "Sondage Employés", 
          description: "Mesurez la satisfaction et l'engagement de vos équipes",
          responses: "210+ utilisations",
          icon: "👥"
        },
        {
          title: "Demande de Congés",
          description: "Automatisez la gestion des demandes de congés",
          responses: "560+ utilisations",
          icon: "🏖️"
        }
      ]
    },
    {
      category: "Événements",
      items: [
        {
          title: "Inscription Événement",
          description: "Gérez les inscriptions à vos webinaires et conférences",
          responses: "670+ utilisations",
          icon: "🎤"
        },
        {
          title: "Feedback Événement",
          description: "Recueillez des retours après vos événements",
          responses: "430+ utilisations",
          icon: "📝"
        },
        {
          title: "Sondage Préférences",
          description: "Découvrez les attentes de votre audience",
          responses: "290+ utilisations",
          icon: "🎯"
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
            Templates
            <span className="text-indigo-600"> prêts à l'emploi</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Commencez rapidement avec nos templates optimisés pour chaque cas d'usage.
          </p>
          <Link
            href="/sign-up"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Utiliser un template
          </Link>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {templates.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {category.items.map((template, templateIndex) => (
                  <div key={templateIndex} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{template.icon}</div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {template.responses}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {template.description}
                    </p>
                    <Link
                      href="/dashboard/forms/new"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Utiliser ce template →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}