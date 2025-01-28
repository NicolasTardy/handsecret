// src/pages/index.js

import { useState } from 'react';
import dynamic from 'next/dynamic';
const Webcam = dynamic(() => import('react-webcam'), { ssr: false });
import ImageUpload from '../components/ImageUpload';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [language, setLanguage] = useState('fr');
  const [formData, setFormData] = useState({
    birthdate: '',
    gender: '',
    image: null
  });
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.birthdate || !formData.gender || !formData.image) {
      setError(language === 'fr' ? 'Veuillez remplir tous les champs.' : 'Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(formData.image);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];

        // Generate description (placeholder)
        const description = await getImageDescription(base64Image);

        if (!description) {
          setError(language === 'fr' ? 'Impossible de générer la description de l\'image.' : 'Unable to generate image description.');
          setLoading(false);
          return;
        }

        // Call the analyze API with the generated description
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthDate: formData.birthdate,
            gender: formData.gender,
            language: language,
            description: description,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setAnalysis(data.analysis);
        } else {
          setError(data.error || (language === 'fr' ? 'Erreur lors de l\'analyse.' : 'Error during analysis.'));
        }
        setLoading(false);
      };
    } catch (err) {
      console.error('Error:', err);
      setError(language === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.');
      setLoading(false);
    }
  };

  // Placeholder function for image description.
  // Replace this with actual integration with an image-to-text API.
  const getImageDescription = async (base64Image) => {
    // For now, return a dummy description
    return language === 'fr'
      ? 'Une main bien éclairée montrant clairement les lignes principales et les monts.'
      : 'A well-lit hand clearly showing the main lines and mounts.';
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([analysis], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = language === 'fr' ? "votre_analyse.txt" : "your_analysis.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      {/* Language Switcher with Flags */}
      <div className="flex justify-end p-4 space-x-4">
        <button
          onClick={() => setLanguage('fr')}
          className={`flex items-center px-4 py-2 rounded-full transition ${
            language === 'fr'
              ? 'bg-white text-indigo-600 shadow-lg transform hover:scale-105'
              : 'bg-indigo-600 text-white hover:bg-indigo-800'
          }`}
        >
          <Image src="/images/fr-flag.png" alt="FR" width={24} height={16} />
          <span className="ml-2 font-bold">FR</span>
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`flex items-center px-4 py-2 rounded-full transition ${
            language === 'en'
              ? 'bg-white text-indigo-600 shadow-lg transform hover:scale-105'
              : 'bg-indigo-600 text-white hover:bg-indigo-800'
          }`}
        >
          <Image src="/images/en-flag.png" alt="EN" width={24} height={16} />
          <span className="ml-2 font-bold">EN</span>
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-2xl animate-pulse">
            {language === 'fr' ? 'Analyse en cours...' : 'Analyzing...'}
          </div>
        </div>
      )}

      {/* Bandeau vidéo */}
      <div className="relative h-96 w-full overflow-hidden">
        <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover brightness-50">
          <source src="/videos/hand.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-md animate-fadeIn">
            {language === 'fr'
              ? 'Libérez votre potentiel grâce à la chiromancie.✨'
              : 'Unlock your potential with chiromancy.✨'}
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white drop-shadow-md max-w-2xl animate-fadeIn delay-200">
            {language === 'fr'
              ? 'Les secrets de vos mains, une carte unique de votre personnalité : découvrez une analyse précise et approfondie grâce à la chiromancie assistée par intelligence artificielle.'
              : 'The secrets of your hands, a unique map of your personality: experience a precise and detailed analysis through chiromancy powered by artificial intelligence.'}
          </p>
        </div>
      </div>

      {/* Sections de contenu */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* La Chiromancie */}
        <section className="mb-12">
          <h2 className="text-4xl font-semibold text-center text-indigo-600 mb-6">
            {language === 'fr' ? 'La Chiromancie 📜' : 'Chiromancy 📜'}
          </h2>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300">
            <p className="text-gray-700 text-lg leading-relaxed">
              {language === 'fr'
                ? "La chiromancie, ou l'art d'interpréter les lignes de la main, possède une histoire riche et captivante qui s'étend sur plusieurs millénaires. 🖐️✨ Ses origines remontent à l'Antiquité, avec des pratiques documentées en Inde et en Chine, où elle était utilisée pour prédire l'avenir et comprendre la personnalité. 📜🌏 Les Grecs anciens, comme l'astrologue Marcella, ont également contribué à son développement en liant la chiromancie à l'astrologie et aux destinées individuelles. 🌟🔮 Au Moyen Âge en Europe, la chiromancie a gagné en popularité parmi les érudits et les cours royales, souvent associée aux arts divinatoires et à la sorcellerie. 👑🔍 Au 20ème siècle, des figures emblématiques telles que Cheiro ont popularisé la chiromancie, la rendant accessible au grand public et renforçant son attrait mystique. Aujourd'hui, la chiromancie continue de fasciner et d'intriguer, offrant une perspective unique sur la personnalité et les possibles avenirs, tout en maintenant une place intrigante dans les pratiques ésotériques modernes. 🌌🔍"
                : "Chiromancy, or the art of interpreting hand lines, has a rich and captivating history spanning several millennia. 🖐️✨ Its origins date back to antiquity, with documented practices in India and China, where it was used to predict the future and understand personality. 📜🌏 Ancient Greeks, like the astrologer Marcella, also contributed to its development by linking chiromancy with astrology and individual destinies. 🌟🔮 In Medieval Europe, chiromancy gained popularity among scholars and royal courts, often associated with divinatory arts and witchcraft. 👑🔍 In the 20th century, iconic figures such as Cheiro popularized chiromancy, making it accessible to the general public and enhancing its mystical appeal. Today, chiromancy continues to fascinate and intrigue, offering a unique perspective on personality and potential futures, while maintaining an intriguing place in modern esoteric practices. 🌌🔍"}
            </p>
          </div>
        </section>

        {/* Votre Analyse Offerte */}
        <section className="mb-12">
          <h2 className="text-4xl font-semibold text-center text-purple-600 mb-6">
            {language === 'fr' ? 'Votre Analyse Offerte 🎁' : 'Your Free Analysis 🎁'}
          </h2>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300">
            <p className="text-gray-700 text-lg leading-relaxed">
              {language === 'fr'
                ? "🌟 Découvrez votre personnalité dans la paume de votre main ! 🖐️ Grâce à une analyse détaillée de vos lignes (ligne de vie, ligne de cœur, ligne de tête) et de vos monts (mont de Vénus, de Jupiter, de Mercure), plongez dans une exploration fascinante de votre potentiel et de vos tendances uniques. 💫 Nos conseils personnalisés vous révéleront des aspects insoupçonnés de vous-même, pour vous aider à mieux vous comprendre et à saisir les opportunités de votre vie. ✨ C’est totalement gratuit ! 🎉 N’attendez plus pour ouvrir la porte à la découverte de vous-même. 🌌👉"
                : "🌟 Discover your personality in the palm of your hand! 🖐️ Through a detailed analysis of your lines (life line, heart line, head line) and mounts (Mount of Venus, Mount of Jupiter, Mount of Mercury), dive into a fascinating exploration of your potential and unique tendencies. 💫 Our personalized advice will reveal unexpected aspects of yourself, helping you better understand and seize opportunities in your life. ✨ It's completely free! 🎉 Don't wait any longer to open the door to self-discovery. 🌌👉"}
            </p>
          </div>
        </section>

        {/* Choisir un fichier */}
        <section className="mb-12">
          <h2 className="text-4xl font-semibold text-center text-indigo-600 mb-6">
            {language === 'fr' ? 'Choisir un Fichier 📂' : 'Choose a File 📂'}
          </h2>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {language === 'fr'
                ? "Prenez une photo de votre main de manière à bien voir la paume et les lignes. Idéalement, placez une pièce de monnaie à côté de votre main pour évaluer la taille de celle-ci et de vos doigts. Assurez-vous que l'image ne dépasse pas 3 Mo pour une analyse optimale. 📸💡"
                : "Take a photo of your hand ensuring that the palm and lines are clearly visible. Ideally, place a coin next to your hand to gauge the size of your hand and fingers. Make sure the image does not exceed 3MB for optimal analysis. 📸💡"}
            </p>
            <div className="flex justify-center mb-6">
              <Image
                src="/images/example-hand.jpg"
                alt={language === 'fr' ? 'Exemple de photo de la paume' : 'Palm Photo Example'}
                width={250}
                height={250}
                className="rounded-lg shadow-md object-cover"
              />
            </div>
            <div className="flex justify-center">
              <ImageUpload setFormData={setFormData} language={language} />
            </div>
          </div>
        </section>

        {/* Formulaire d'analyse */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-black text-lg mb-2">
                📅 {language === 'fr' ? 'Date de naissance' : 'Birth Date'}
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-black"
                onChange={e => setFormData({...formData, birthdate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-black text-lg mb-2">
                🚻 {language === 'fr' ? 'Genre' : 'Gender'}
              </label>
              <select
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-black"
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option value="">{language === 'fr' ? 'Sélectionnez' : 'Select'}</option>
                <option value="male">{language === 'fr' ? 'Homme' : 'Male'}</option>
                <option value="female">{language === 'fr' ? 'Femme' : 'Female'}</option>
                <option value="other">{language === 'fr' ? 'Autre' : 'Other'}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-purple-600 text-white py-4 rounded-full hover:bg-purple-700 transition duration-300 text-lg font-bold shadow-md hover:shadow-lg"
          >
            {language === 'fr' ? 'Obtenir mon analyse' : 'Get my analysis'}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="mt-6 text-center">
            <p className="text-indigo-600 text-xl">{language === 'fr' ? 'Analyse en cours...' : 'Analyzing...'}</p>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="mt-6 text-center">
            <p className="text-red-500 text-xl">{error}</p>
          </div>
        )}

        {/* Analyse */}
        {analysis && (
          <div className="mt-6 bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition duration-300">
            <h2 className="text-3xl font-bold mb-4 text-purple-600 text-center">
              {language === 'fr' ? 'Votre Analyse' : 'Your Analysis'}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-6">
              {analysis}
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                className="bg-indigo-600 text-white py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300 text-lg font-semibold shadow-md hover:shadow-lg"
              >
                {language === 'fr' ? 'Télécharger mon analyse' : 'Download My Analysis'}
              </button>
            </div>
          </div>
        )}

        {/* Bouton Conditions de Service */}
        <div className="flex justify-center mt-12">
          <Link href="/conditions">
            <span className="text-indigo-600 hover:text-indigo-800 text-lg font-semibold underline cursor-pointer">
              {language === 'fr' ? 'Consulter les conditions de services' : 'View Terms of Service'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">{title}</h2>
    <div className="bg-white p-6 rounded-lg shadow-md">
      {children}
    </div>
  </section>
);
