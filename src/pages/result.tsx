// src/pages/result.tsx

import { useRouter } from 'next/router';
import { useLanguage } from '../components/Layout';
import { saveAs } from 'file-saver';

const ResultPage = () => {
  const router = useRouter();
  const { analysis, description } = router.query;
  const { language } = useLanguage();

  if (
    (!analysis || typeof analysis !== 'string') &&
    (!description || typeof description !== 'string')
  ) {
    return (
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-center">
          {language === 'fr' ? 'Analyse Manquante' : 'Missing Analysis'}
        </h2>
        <p className="text-center text-gray-700">
          {language === 'fr'
            ? "Il semble qu'il y ait un problème avec votre demande. Veuillez réessayer."
            : 'There seems to be an issue with your request. Please try again.'}
        </p>
      </div>
    );
  }

  const handleDownload = () => {
    let content = '';
    if (typeof analysis === 'string') {
      content = analysis;
    } else if (typeof description === 'string') {
      content = description;
    }

    // Ensure content is always a string
    if (typeof content !== 'string') {
      content = '';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'analyse_chiromancie.txt');
  };

  return (
    <div className="container mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-center">
        {language === 'fr' ? 'Votre Analyse de Chiromancie 🔮' : 'Your Chiromancy Analysis 🔮'}
      </h2>
      <div className="bg-white p-8 rounded-3xl shadow-2xl">
        <div className="overflow-auto max-h-96">
          <p className="text-gray-700 text-lg md:text-xl whitespace-pre-wrap">
            {analysis || description}
          </p>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {language === 'fr' ? 'Télécharger' : 'Download'} 📥
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
