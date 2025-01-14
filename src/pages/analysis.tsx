// src/pages/analysis.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../components/Layout';

const Analysis = () => {
  const { language } = useLanguage();
  const router = useRouter();
  const { birthDate, gender, photo } = router.query;

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (birthDate && gender && photo) {
      const fetchAnalysis = async () => {
        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              birthDate,
              gender,
              photo,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setAnalysis(data.analysis);
          } else {
            setError(data.message || (language === 'fr' ? 'Erreur lors de l\'analyse.' : 'Error during analysis.'));
          }
        } catch (err: any) {
          setError(language === 'fr' ? 'Erreur lors de l\'analyse.' : 'Error during analysis.');
        } finally {
          setLoading(false);
        }
      };

      fetchAnalysis();
    }
  }, [birthDate, gender, photo, language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{language === 'fr' ? 'Analyse en cours...' : 'Analyzing...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300">
          {language === 'fr' ? 'Retour à la page d\'accueil 🏠' : 'Back to Home 🏠'}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold">
            {language === 'fr' ? 'Votre Analyse Chiromantique 🔮' : 'Your Chiromantic Analysis 🔮'}
          </h1>
        </div>
      </header>

      {/* Analysis Section */}
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <section className="bg-white p-8 rounded-3xl shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl md:text-4xl font-semibold mb-4">
                {language === 'fr' ? 'Informations Personnelles' : 'Personal Information'}
              </h2>
              <p className="text-gray-700 text-lg">
                <strong>{language === 'fr' ? 'Date de Naissance:' : 'Birth Date:'}</strong> {birthDate}
              </p>
              <p className="text-gray-700 text-lg">
                <strong>{language === 'fr' ? 'Genre:' : 'Gender:'}</strong> {gender === 'male' ? (language === 'fr' ? 'Homme' : 'Male') : gender === 'female' ? (language === 'fr' ? 'Femme' : 'Female') : (language === 'fr' ? 'Autre' : 'Other')}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl md:text-4xl font-semibold mb-4">
                {language === 'fr' ? 'Photo de la Paume' : 'Palm Photo'}
              </h2>
              {photo && (
                <Image
                  src={photo as string}
                  alt="Photo de la paume"
                  width={192}
                  height={192}
                  className="mx-auto rounded-lg shadow-lg object-cover"
                />
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl md:text-4xl font-semibold mb-4">
                {language === 'fr' ? 'Analyse Chiromantique' : 'Chiromantic Analysis'}
              </h2>
              <p className="text-gray-700 text-lg whitespace-pre-wrap">
                {analysis}
              </p>
            </div>

            <div className="text-center">
              <Link href="/" className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300">
                {language === 'fr' ? 'Retour à la page d\'accueil 🏠' : 'Back to Home 🏠'}
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="text-sm hover:underline">
            {language === 'fr' ? 'Retour à la page d\'accueil 🏠' : 'Back to Home 🏠'}
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Analysis;
