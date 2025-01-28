// src/pages/conditions.js

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Conditions({ language }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      {/* Bandeau Conditions */}
      <div className="flex justify-center p-8">
        <h1 className="text-4xl font-bold text-indigo-600">
          {language === 'fr' ? 'Conditions de Service' : 'Terms of Service'}
        </h1>
      </div>

      {/* Contenu des conditions */}
      <div className="flex-1 max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300">
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          {language === 'fr'
            ? "Bienvenue dans nos conditions de service. En utilisant notre plateforme, vous acceptez les termes et conditions suivants..."
            : "Welcome to our Terms of Service. By using our platform, you agree to the following terms and conditions..."}
        </p>
        {/* Ajoutez ici les détails des conditions de service */}
      </div>

      {/* Bouton Retour */}
      <div className="flex justify-center p-8">
        <Link href="/">
          <a className="text-indigo-600 hover:text-indigo-800 text-lg font-semibold underline">
            {language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          </a>
        </Link>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { lang } = context.query;
  const language = lang === 'en' ? 'en' : 'fr';

  return {
    props: { language },
  };
}
