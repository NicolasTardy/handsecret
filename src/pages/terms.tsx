// src/pages/terms.tsx

import { useLanguage } from '../components/Layout';
import Link from 'next/link';

const Terms = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-semibold">
            {language === 'fr' ? 'Conditions Générales de Vente 📜' : 'Terms and Conditions 📜'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <section className="bg-white p-8 rounded-3xl shadow-lg">
            <h2 className="text-2xl md:text-4xl font-semibold mb-4">
              {language === 'fr' ? '1. Introduction' : '1. Introduction'}
            </h2>
            <p className="text-gray-700 mb-6">
              {language === 'fr'
                ? 'Bienvenue chez Chiromancie AI. En utilisant nos services, vous acceptez les termes et conditions suivants...'
                : 'Welcome to Chiromancy AI. By using our services, you agree to the following terms and conditions...'}
            </p>

            <h2 className="text-2xl md:text-4xl font-semibold mb-4">
              {language === 'fr' ? '2. Services' : '2. Services'}
            </h2>
            <p className="text-gray-700 mb-6">
              {language === 'fr'
                ? 'Nous offrons une analyse de chiromancie assistée par intelligence artificielle qui interprète les données fournies...'
                : 'We offer AI-powered chiromancy analysis that interprets the data provided...'}
            </p>

            {/* Ajoutez d'autres sections si nécessaire */}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <Link href="/">
            <a className="text-sm hover:underline">
              {language === 'fr' ? 'Retour à la page d\'accueil 🏠' : 'Back to Home 🏠'}
            </a>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
