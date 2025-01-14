// src/pages/description.tsx

import { useRouter } from 'next/router';
import { useState } from 'react';
import { useLanguage } from '../components/Layout';

const DescriptionPage = () => {
  const router = useRouter();
  const { description, birthDate, gender } = router.query;
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleContinue = async () => {
    if (!description || typeof description !== 'string') {
      setError(language === 'fr' ? 'Description manquante.' : 'Missing description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          birthDate,
          gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || (language === 'fr' ? 'Erreur lors de l\'analyse.' : 'Error during analysis.'));
        setLoading(false);
        return;
      }

      const analysis = data.analysis;

      router.push({
        pathname: '/result',
        query: { analysis },
      });
    } catch (err: any) {
      setError(language === 'fr' ? 'Erreur lors de l\'appel API.' : 'Error during API call.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-center">
        {language === 'fr' ? 'Description Complète de Votre Main 🖐️' : 'Complete Description of Your Hand 🖐️'}
      </h2>
      <div className="bg-white p-8 rounded-3xl shadow-2xl">
        <div className="overflow-auto max-h-96">
          <p className="text-gray-700 text-lg md:text-xl whitespace-pre-wrap">
            {description}
          </p>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={handleContinue}
            className="bg-indigo-600 text-white py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300"
            disabled={loading}
          >
            {loading
              ? (language === 'fr' ? 'Chargement...' : 'Loading...')
              : (language === 'fr' ? 'CONTINUEZ POUR OBTENIR L’ANALYSE 🔮' : 'CONTINUE TO GET THE ANALYSIS 🔮')}
          </button>
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default DescriptionPage;
