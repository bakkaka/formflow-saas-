import { analyzeFormResponses } from './openai';

// Données de test
const testResponses = [
  {
    response_data: {
      satisfaction: "Très satisfait",
      note: "5",
      commentaire: "Excellent service !"
    }
  },
  {
    response_data: {
      satisfaction: "Satisfait", 
      note: "4",
      commentaire: "Très bon mais un peu lent"
    }
  }
];

const testForm = {
  fields: [
    {
      question: "Niveau de satisfaction",
      type: "select",
      options: ["Très satisfait", "Satisfait", "Neutre", "Insatisfait"]
    },
    {
      question: "Note sur 5",
      type: "radio", 
      options: ["1", "2", "3", "4", "5"]
    },
    {
      question: "Commentaires",
      type: "textarea"
    }
  ]
};

// Testez l'analyse
async function testAnalysis() {
  console.log('🧪 Test de l\'analyse OpenAI...');
  
  try {
    const result = await analyzeFormResponses(testResponses, testForm);
    console.log('✅ Analyse réussie !');
    console.log('Insights:', result.insights);
    console.log('Résumé:', result.summary);
    console.log('Recommandations:', result.recommendations);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAnalysis();