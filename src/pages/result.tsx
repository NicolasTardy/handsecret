// src/pages/result.tsx

import { useRouter } from 'next/router';
import { useLanguage } from '../components/Layout';

const ResultPage = () => {
  const router = useRouter();
  const { analysis } = router.query;
  const { language } = useLanguage();

  if (!analysis || typeof analysis !== 'string') {
    return (
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-center">
          {language === 'fr' ? 'Analyse Manquante' : 'Missing Analysis'}
        </h2>
        <p className="text-center text-gray-700">
          {language === 'fr' ? 'Il semble qu\'il y ait un problème avec votre demande. Veuillez réessayer.' : 'There seems to be an issue with your request. Please try again.'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-center">
        {language === 'fr' ? 'Votre Analyse de Chiromancie 🔮' : 'Your Chiromancy Analysis 🔮'}
      </h2>
      <div className="bg-white p-8 rounded-3xl shadow-2xl">
        <div className="overflow-auto max-h-96">
          <p className="text-gray-700 text-lg md:text-xl whitespace-pre-wrap">
            {analysis}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
