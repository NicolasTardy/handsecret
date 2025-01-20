// src/pages/index.tsx

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../components/Layout';
import Image from 'next/image';
import { useRouter } from 'next/router';
import imageCompression from 'browser-image-compression';
import axios from 'axios';

const Home = () => {
  const { language } = useLanguage();
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const previousImageUrlRef = useRef<string | null>(null);

  const uploadInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fonction pour compresser l'image à moins de 1 Mo
  const compressImage = async (file: File): Promise<File | null> => {
    let options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      initialQuality: 0.8,
      fileType: 'image/jpeg',
    };

    try {
      let compressedFile = await imageCompression(file, options);

      // Réduire la qualité jusqu'à ce que la taille soit inférieure ou égale à 1 Mo
      while (compressedFile.size / 1024 / 1024 > 1 && options.initialQuality > 0.2) {
        options = { ...options, initialQuality: options.initialQuality - 0.1 };
        compressedFile = await imageCompression(file, options);
      }

      if (compressedFile.size / 1024 / 1024 > 1) {
        setError(
          language === 'fr'
            ? 'Impossible de compresser l\'image à moins de 1 Mo. Veuillez choisir une image plus petite ou de meilleure qualité.'
            : 'Unable to compress the image below 1MB. Please choose a smaller or higher quality image.'
        );
        return null;
      }

      return compressedFile;
    } catch (error) {
      console.error('Erreur lors de la compression de la photo:', error);
      setError(
        language === 'fr'
          ? 'Erreur lors de la compression de la photo.'
          : 'Error compressing photo.'
      );
      return null;
    }
  };

  // Gestion de la soumission du formulaire pour la description
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !gender || !photo) {
      setError(
        language === 'fr'
          ? 'Veuillez remplir tous les champs.'
          : 'Please fill in all fields.'
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append('birthDate', birthDate);
      formData.append('gender', gender);
      formData.append('photo', photo);

      // Appel API pour obtenir la description
      const response = await axios.post('/api/analyze/description', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;

      if (response.status !== 200) {
        setError(
          data.message ||
            (language === 'fr'
              ? 'Erreur lors de l\'analyse.'
              : 'Error during analysis.')
        );
        return;
      }

      const description = data.description;

      // Rediriger vers la page de description avec les données nécessaires
      router.push({
        pathname: '/description',
        query: {
          description,
          birthDate,
          gender,
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (language === 'fr'
            ? 'Erreur lors de l\'appel API.'
            : 'Error during API call.')
      );
    }
  };

  // Gestion du clic sur le bouton de téléchargement d'image
  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  // Gestion du changement de fichier
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];

      // Compression de l'image
      const compressedFile = await compressImage(file);
      if (!compressedFile) return;

      const objectUrl = URL.createObjectURL(compressedFile);

      // Révoquer l'URL précédente si elle existe et n'est pas en Base64
      if (previousImageUrlRef.current && !imageSrc?.startsWith('data:')) {
        URL.revokeObjectURL(previousImageUrlRef.current);
      }

      previousImageUrlRef.current = objectUrl;
      setImageSrc(objectUrl);
      setPhoto(compressedFile);
      setError(null);
    }
  };

  // Gestion du clic sur le bouton de prise de photo
  const handleTakePhotoClick = () => {
    setShowCamera(true);
  };

  // Capture de la photo depuis la caméra
  const handleCapturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });

            // Compression de l'image capturée
            const compressedFile = await compressImage(file);
            if (!compressedFile) return;

            const compressedImageDataURL = await imageCompression.getDataUrlFromFile(compressedFile);

            // Révoquer l'URL précédente si elle existe et n'est pas en Base64
            if (previousImageUrlRef.current && !imageSrc?.startsWith('data:')) {
              URL.revokeObjectURL(previousImageUrlRef.current);
            }

            setImageSrc(compressedImageDataURL);
            setPhoto(compressedFile);
            setShowCamera(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  // Fermeture du modal de la caméra
  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  // Effet pour gérer l'accès à la caméra
  useEffect(() => {
    if (showCamera && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          videoRef.current!.play();
        })
        .catch((err) => {
          console.error('Erreur lors de l\'accès à la caméra:', err);
          setShowCamera(false);
          setError(
            language === 'fr'
              ? 'Erreur lors de l\'accès à la caméra.'
              : 'Error accessing camera.'
          );
        });
    }

    // Nettoyage du flux vidéo lors du démontage ou de la fermeture du modal
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera, language]);

  return (
    <div className="flex flex-col">
      {/* Section Vidéo de Fond */}
      <div className="w-full h-screen relative">
        <video
          className="w-full h-full object-cover"
          src="/videos/divination.mp4"
          autoPlay
          muted
          loop
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-extrabold drop-shadow-lg">
              {language === 'fr'
                ? 'Découvrez votre avenir grâce à la chiromancie.✨'
                : 'Discover your future with chiromancy.✨'}
            </h1>
            <p className="mt-6 text-2xl md:text-3xl drop-shadow-md">
              {language === 'fr'
                ? 'Révélez les secrets de vos mains avec une analyse gratuite et personnalisée assistée par intelligence artificielle.'
                : 'Reveal the secrets of your hands with a free, personalized analysis powered by artificial intelligence.'}
            </p>
            <button className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 transition duration-300">
              {language === 'fr' ? 'Commencez Maintenant 🚀' : 'Start Now 🚀'}
            </button>
          </div>
        </div>
      </div>

      {/* Section d'Introduction */}
      <section className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-semibold">
            {language === 'fr' ? 'Bienvenue chez Chiromancie AI 🌟' : 'Welcome to Chiromancy AI 🌟'}
          </h2>
          <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto">
            {language === 'fr'
              ? 'La chiromancie interprète les lignes et les formes de votre paume pour révéler les secrets de votre personnalité. Grâce à notre intelligence artificielle avancée, bénéficiez d\'une analyse gratuite et précise de votre caractère unique.'
              : 'Chiromancy interprets the lines and shapes of your palm to reveal the secrets of your personality. With our advanced artificial intelligence, enjoy a free and precise analysis of your unique character.'}
          </p>
        </div>
      </section>

      {/* Section de Description du Produit */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold mb-6">
            {language === 'fr' ? 'Obtenez Votre Analyse Gratuite 🖐️🔮' : 'Get Your Free Analysis 🖐️🔮'}
          </h2>
          <p className="text-gray-700 text-lg md:text-xl mb-8">
            {language === 'fr'
              ? 'Recevez une analyse détaillée de votre paume de main qui révélera vos traits de personnalité, vos forces et vos faiblesses. Découvrez comment la chiromancie peut vous guider vers un avenir meilleur.'
              : 'Receive a detailed analysis of your palm that will reveal your personality traits, strengths, and weaknesses. Discover how chiromancy can guide you towards a better future.'}
          </p>
          <button className="bg-indigo-600 text-white py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300">
            {language === 'fr' ? 'Commencer Gratuitement 🎉' : 'Start for Free 🎉'}
          </button>
        </div>
      </section>

      {/* Section du Formulaire d'Informations Personnelles */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-12">
            {language === 'fr' ? 'Remplissez Vos Informations 📋' : 'Fill in Your Information 📋'}
          </h2>
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-2xl flex flex-col space-y-6">
            {/* Date de Naissance */}
            <div>
              <label className="block text-gray-700 text-lg mb-2">
                📅 {language === 'fr' ? 'Date de naissance' : 'Birth Date'}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-gray-700 text-lg mb-2">
                🚻 {language === 'fr' ? 'Genre' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="">{language === 'fr' ? 'Sélectionnez' : 'Select'}</option>
                <option value="male">{language === 'fr' ? 'Homme' : 'Male'}</option>
                <option value="female">{language === 'fr' ? 'Femme' : 'Female'}</option>
                <option value="other">{language === 'fr' ? 'Autre' : 'Other'}</option>
              </select>
            </div>

            {/* Téléchargement de Photo */}
            <div>
              <label className="block text-gray-700 text-lg mb-2">
                📸 {language === 'fr' ? 'Téléchargez une photo de votre main' : 'Upload a photo of your hand'}
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-full sm:w-auto bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 mb-4 sm:mb-0"
                >
                  {language === 'fr' ? 'Télécharger Image 📤' : 'Upload Image 📤'}
                </button>
                <button
                  type="button"
                  onClick={handleTakePhotoClick}
                  className="w-full sm:w-auto bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                >
                  {language === 'fr' ? 'Prendre Photo 📷' : 'Take a Photo 📷'}
                </button>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={uploadInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Affichage de la Photo Téléchargée ou Capturée */}
            {imageSrc && (
              <div className="mt-4 text-center">
                <Image
                  src={imageSrc}
                  alt={language === 'fr' ? "Photo de la paume" : "Palm Photo"}
                  width={192}
                  height={192}
                  className="mx-auto rounded-lg shadow-lg object-cover"
                  style={{ width: 'auto', height: 'auto' }}
                />
                <p className="mt-2 text-gray-700 text-sm md:text-base">
                  {language === 'fr' ? 'Votre photo' : 'Your photo'}
                </p>
              </div>
            )}

            {/* Image et Texte du Guide */}
            <div className="mt-4 text-center">
              <Image
                src="/images/palm-photo-guide.png"
                alt={language === 'fr' ? "Guide pour la photo de la paume" : "Guide for Palm Photo"}
                width={192}
                height={192}
                className="mx-auto rounded-lg shadow-lg object-cover"
                style={{ width: 'auto', height: 'auto' }}
              />
              <p className="mt-2 text-gray-700 text-sm md:text-base">
                {language === 'fr' ? 'Voici comment prendre une photo correcte' : 'Here is how to take a proper photo'}
              </p>
            </div>

            {/* Affichage des Erreurs */}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {/* Bouton de Soumission */}
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-full hover:bg-indigo-700 transition duration-300"
              >
                {language === 'fr' ? 'Obtenir Mon Analyse 🔍' : 'Get My Analysis 🔍'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Section Explication de la Chiromancie */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-center">
            {language === 'fr' ? 'Qu\'est-ce que la Chiromancie ? 🔮' : 'What is Chiromancy? 🔮'}
          </h3>
          <p className="text-gray-700 text-base md:text-lg text-center">
            {language === 'fr' ? (
              <>
                La chiromancie, également connue sous le nom de palmistry, est l'art d'interpréter les lignes, les formes et les motifs présents sur la paume de la main. Cette pratique ancienne vise à révéler les traits de personnalité, les forces, les faiblesses et les potentialités d'une personne. En observant minutieusement les différentes lignes telles que la ligne de vie, la ligne de tête et la ligne du cœur, les chiromanciens peuvent fournir des aperçus profonds sur un individu.
              </>
            ) : (
              <>
                Chiromancy, also known as palmistry, is the art of interpreting the lines, shapes, and patterns present on the palm of the hand. This ancient practice aims to reveal a person's personality traits, strengths, weaknesses, and potentials. By carefully observing the various lines such as the life line, head line, and heart line, chiromancers can provide deep insights into an individual's character and future.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Modal de la Caméra */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <h2 className="text-2xl mb-4 text-center">
              {language === 'fr' ? 'Prenez une Photo 📷' : 'Take a Photo 📷'}
            </h2>
            <video ref={videoRef} className="w-full h-auto rounded-lg" autoPlay muted />
            <div className="flex justify-between mt-4">
              <button
                onClick={handleCapturePhoto}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 mr-2"
              >
                {language === 'fr' ? 'Capturer 📸' : 'Capture 📸'}
              </button>
              <button
                onClick={handleCloseCamera}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300 ml-2"
              >
                {language === 'fr' ? 'Annuler ❌' : 'Cancel ❌'}
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
