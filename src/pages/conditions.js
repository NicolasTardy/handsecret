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
            ? "Bienvenue dans les conditions de service de Hand-Secrets. En utilisant notre plateforme, vous acceptez les termes et conditions suivants. Nous tenons à vous informer que nous ne conservons aucune donnée personnelle. Toutes les informations que vous fournissez sont utilisées uniquement pour fournir nos services et ne sont pas stockées sur nos serveurs."
            : "Welcome to Hand-Secrets' Terms of Service. By using our platform, you agree to the following terms and conditions. We want to inform you that we do not retain any personal data. All information you provide is used solely to deliver our services and is not stored on our servers."}
        </p>
        {/* Ajoutez ici les détails des conditions de service */}
      </div>

      {/* Bouton Retour */}
      <div className="flex justify-center p-8">
        <Link
          href="/"
          className="text-indigo-600 hover:text-indigo-800 text-lg font-semibold underline"
        >
          {language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
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
