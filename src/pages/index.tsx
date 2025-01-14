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
      while (
        compressedFile.size / 1024 / 1024 > 1 &&
        options.initialQuality > 0.2
      ) {
        options = { ...options, initialQuality: options.initialQuality - 0.1 };
        compressedFile = await imageCompression(file, options);
      }

      if (compressedFile.size / 1024 / 1024 > 1) {
        setError(
          language === 'fr'
            ? "Impossible de compresser l'image à moins de 1 Mo. Veuillez choisir une image plus petite ou de meilleure qualité."
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

  // Gestion de la soumission du formulaire pour l'analyse
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
              ? "Erreur lors de l'analyse."
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
            ? "Erreur lors de l'appel API."
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

  // Gestion du clic sur le bouton pour prendre une photo via la caméra
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
            const file = new File([blob], 'captured-photo.jpg', {
              type: 'image/jpeg',
            });

            // Compression de l'image capturée
            const compressedFile = await compressImage(file);
            if (!compressedFile) return;

            const compressedImageDataURL =
              await imageCompression.getDataUrlFromFile(compressedFile);

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

  // Accès à la caméra
  useEffect(() => {
    if (showCamera && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
          videoRef.current!.play();
        })
        .catch((err) => {
          console.error("Erreur lors de l'accès à la caméra:", err);
          setShowCamera(false);
          setError(
            language === 'fr'
              ? "Erreur lors de l'accès à la caméra."
              : 'Error accessing camera.'
          );
        });
    }

    // Nettoyage du flux vidéo
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera, language]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* SECTION : Vidéo de Fond */}
      <div className="w-full h-screen relative">
        <video
          className="w-full h-full object-cover"
          src="/videos/divination.mp4"
          autoPlay
          muted
          loop
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1
              className="text-5xl md:text-7xl font-extrabold drop-shadow-lg"
              style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              {language === 'fr'
                ? 'Libérez votre potentiel grâce à la chiromancie.✨'
                : 'Unlock your potential with chiromancy.✨'}
            </h1>
            <p
              className="mt-6 text-2xl md:text-3xl drop-shadow-md"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {language === 'fr'
                ? 'Les secrets de vos mains, une carte unique de votre personnalité : découvrez une analyse précise et approfondie grâce à la chiromancie assistée par intelligence artificielle.'
                : 'The secrets of your hands, a unique map of your personality: discover a precise and profound analysis through chiromancy powered by AI.'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION : Introduction */}
      <section className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2
            className="text-4xl md:text-6xl font-semibold"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {language === 'fr'
              ? 'Bienvenue chez Chiromancie AI 🌟'
              : 'Welcome to Chiromancy AI 🌟'}
          </h2>
          <p
            className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {language === 'fr'
              ? 'La chiromancie est une science divinatoire qui interprète les lignes et les formes de la paume de la main pour révéler les secrets de votre personnalité. Grâce à notre intelligence artificielle, nous vous offrons une analyse précise et personnalisée de votre caractère unique.'
              : 'Chiromancy is a divinatory science that interprets the lines and shapes of the palm to reveal the secrets of your personality. With our advanced AI, we provide you a precise and personalized reading of your unique traits.'}
          </p>
        </div>
      </section>

      {/* SECTION : Votre Analyse de Chiromancie 🖐️🔮 (nouveau texte) */}
      <section className="bg-gradient-to-br from-white to-purple-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2
            className="text-3xl md:text-5xl font-extrabold mb-6 text-purple-700"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {language === 'fr'
              ? 'Votre Analyse de Chiromancie 🖐️🔮'
              : 'Your Chiromancy Analysis 🖐️🔮'}
          </h2>
          {/* TEXTE MARKETING avec termes techniques chiromancie */}
          <p
            className="text-gray-800 text-xl md:text-2xl mb-8 leading-relaxed max-w-3xl mx-auto font-serif"
          >
            {language === 'fr' ? (
              <>
                Grâce à l’étude poussée de vos <strong>monts</strong> (Jupiter,
                Saturne, Vénus, Lune...) et de vos <strong>lignes</strong> (Vie,
                Tête, Cœur, Destin), notre intelligence artificielle met en
                lumière vos points forts et vos défis personnels. La forme, la
                longueur et même l’intensité de ces tracés dessinent la carte
                secrète de votre potentiel. Pour seulement{' '}
                <span className="text-pink-600 text-2xl font-bold">
                  1,99€
                </span>
                , offrez-vous une vision inédite de vous-même et découvrez à
                quel point nos prédictions peuvent être révélatrices. Nous vous
                remettons un guide complet pour saisir chaque opportunité que
                votre main dévoile et ainsi maximiser toutes vos capacités.
              </>
            ) : (
              <>
                By conducting an in-depth study of your{' '}
                <strong>mounts</strong> (Jupiter, Saturn, Venus, Moon…) and your{' '}
                <strong>lines</strong> (Life, Head, Heart, Fate), our AI brings
                to light your personal strengths and challenges. The shape,
                length, and even the intensity of these markings form the secret
                map of your potential. For just{' '}
                <span className="text-pink-600 text-2xl font-bold">
                  €1.99
                </span>
                , treat yourself to an unprecedented view of who you are and
                discover how revelatory our predictions can be. We provide a
                comprehensive guide to unlock every opportunity your hand
                reveals and maximize your inherent abilities.
              </>
            )}
          </p>
          {/* Section "Comment ça marche ?" */}
          <div className="max-w-4xl mx-auto text-left bg-white p-8 mb-8 rounded-3xl shadow-2xl">
            <h3
              className="text-2xl font-semibold mb-4 text-indigo-600"
              style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              {language === 'fr'
                ? 'Comment ça marche ?'
                : 'How does it work?'}
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg font-serif">
              <li>
                {language === 'fr' ? (
                  <>
                    Renseignez vos informations personnelles <b>*</b>{' '}
                    <br />
                    <span className="text-sm text-gray-500">
                      (* Vos données ne sont pas conservées)
                    </span>
                  </>
                ) : (
                  <>
                    Provide your personal information <b>*</b>
                    <br />
                    <span className="text-sm text-gray-500">
                      (* Your data is not stored)
                    </span>
                  </>
                )}
              </li>
              <li>
                {language === 'fr'
                  ? 'Ajoutez une photo de votre main (avec un stylo ou une pièce si possible). Plus la photo est nette et lumineuse, plus l’analyse sera précise !'
                  : 'Upload a photo of your hand (with a pen or coin if possible). The clearer and brighter the photo, the more precise the reading!'}
              </li>
            </ul>
          </div>
          <button
            className="bg-purple-600 text-white py-3 px-8 rounded-full hover:bg-purple-700 transition duration-300 shadow-xl text-xl font-bold transform hover:scale-105"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {language === 'fr' ? 'Je veux mon portrait maintenant 💳' : 'I Want My Reading Now 💳'}
          </button>
        </div>
      </section>

      {/* SECTION : Témoignages (design fun/coloré) */}
      <section className="py-16 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-100">
        <div className="container mx-auto px-6">
          <h2
            className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-pink-800"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {language === 'fr'
              ? 'Témoignages de Clients Satisfaits'
              : 'Satisfied Customers Speak Up'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-serif">
            <div className="bg-white p-6 rounded-lg shadow-xl transform hover:scale-105 transition duration-300">
              <p className="text-pink-800 italic text-lg">
                {language === 'fr'
                  ? "“L’analyse est incroyablement précise ! Je me suis reconnue à 100%. J’ai même découvert quelques surprises sur moi-même.”"
                  : '"The reading was incredibly precise! I recognized myself 100%. I even discovered a few surprises about myself."'}
              </p>
              <div className="mt-4 text-right">
                <span className="font-bold text-pink-700">- Marie</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-xl transform hover:scale-105 transition duration-300">
              <p className="text-pink-800 italic text-lg">
                {language === 'fr'
                  ? "“Une expérience géniale à petit prix ! Bluffée par la qualité de l’analyse. Ça donne envie d’en savoir plus !”"
                  : '"An amazing experience at such a low price! I was blown away by the quality of the analysis. Makes me want to learn more!"'}
              </p>
              <div className="mt-4 text-right">
                <span className="font-bold text-pink-700">- Julien</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-xl transform hover:scale-105 transition duration-300">
              <p className="text-pink-800 italic text-lg">
                {language === 'fr'
                  ? "“Application intuitive, rapport reçu en quelques minutes. Je recommande à tout le monde !”"
                  : '"User-friendly process, got my report in minutes. I highly recommend this to everyone!"'}
              </p>
              <div className="mt-4 text-right">
                <span className="font-bold text-pink-700">- Chloé</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION : Formulaire d'informations personnelles */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2
            className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-purple-800"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {language === 'fr'
              ? 'Vos Informations Personnelles pour une Analyse Sur-Mesure 📋'
              : 'Your Personal Details for a Tailor-Made Analysis 📋'}
          </h2>
          <p
            className="max-w-2xl mx-auto text-center text-gray-700 mb-10 text-lg leading-relaxed"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {language === 'fr'
              ? "Plus nous en savons sur vous (date de naissance, genre, etc.), plus notre IA pourra fournir une analyse précise. C’est l’occasion parfaite de découvrir chaque secret que vos mains révèlent."
              : "The more we know about you (birth date, gender, etc.), the better our AI can deliver a precise reading. It's the perfect opportunity to uncover every secret your hands reveal."}
          </p>
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-2xl flex flex-col space-y-6"
          >
            {/* Date de naissance */}
            <div>
              <label
                className="block text-gray-700 text-lg mb-2"
                style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                📅 {language === 'fr' ? 'Date de naissance' : 'Birth Date'}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-700"
              />
            </div>

            {/* Genre */}
            <div>
              <label
                className="block text-gray-700 text-lg mb-2"
                style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                🚻 {language === 'fr' ? 'Genre' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-700"
              >
                <option value="">
                  {language === 'fr' ? 'Sélectionnez' : 'Select'}
                </option>
                <option value="male">
                  {language === 'fr' ? 'Homme' : 'Male'}
                </option>
                <option value="female">
                  {language === 'fr' ? 'Femme' : 'Female'}
                </option>
                <option value="other">
                  {language === 'fr' ? 'Autre' : 'Other'}
                </option>
              </select>
            </div>

            {/* Téléchargement de photo */}
            <div>
              <label
                className="block text-gray-700 text-lg mb-2"
                style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                📸{' '}
                {language === 'fr'
                  ? 'Télécharger une photo de votre main'
                  : 'Upload a photo of your hand'}
              </label>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                  style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                  {language === 'fr'
                    ? 'Télécharger une image 📤'
                    : 'Upload Image 📤'}
                </button>
                <button
                  type="button"
                  onClick={handleTakePhotoClick}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                  style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                  {language === 'fr'
                    ? 'Prendre une photo 📷'
                    : 'Take a Photo 📷'}
                </button>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={uploadInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-3">
                {language === 'fr'
                  ? 'Astuce : placez un stylo ou une pièce de monnaie à côté pour aider notre IA à analyser la taille de votre main.'
                  : 'Tip: place a pen or coin next to your hand to help our AI gauge the size of your palm and fingers.'}
              </p>
            </div>

            {/* Affichage de la photo téléchargée ou capturée */}
            {imageSrc && (
              <div className="mt-4 text-center">
                <Image
                  src={imageSrc}
                  alt={
                    language === 'fr'
                      ? 'Photo de la paume'
                      : 'Photo of the palm'
                  }
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

            {/* Guide visuel */}
            <div className="mt-4 text-center">
              <Image
                src="/images/palm-photo-guide.png"
                alt={
                  language === 'fr'
                    ? 'Guide pour la photo de la paume'
                    : 'Palm Photo Guide'
                }
                width={192}
                height={192}
                className="mx-auto rounded-lg shadow-lg object-cover"
                style={{ width: 'auto', height: 'auto' }}
              />
              <p className="mt-2 text-gray-700 text-sm md:text-base">
                {language === 'fr'
                  ? 'Voilà comment la photo doit être prise'
                  : 'Here is how the photo should be taken'}
              </p>
            </div>

            {/* Erreurs éventuelles */}
            {error && (
              <p
                className="text-red-500 text-center"
                style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                {error}
              </p>
            )}

            {/* Bouton de soumission */}
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-full hover:bg-purple-700 transition duration-300 text-lg font-semibold transform hover:scale-105"
                style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                {language === 'fr'
                  ? 'Soumettre mon portrait 📤'
                  : 'Submit My Portrait 📤'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION : Qu'est-ce que la Chiromancie ? 🔮 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h3
            className="text-3xl md:text-4xl font-semibold mb-6 text-center text-purple-800"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            {language === 'fr'
              ? "Qu'est-ce que la Chiromancie ? 🔮"
              : 'What is Chiromancy? 🔮'}
          </h3>
          <p
            className="text-gray-700 text-base md:text-lg leading-relaxed max-w-4xl mx-auto font-serif"
            style={{ fontSize: '1.125rem' }}
          >
            {language === 'fr' ? (
              <>
                La chiromancie, ou l'art de lire les lignes de la main ✋, trouve
                ses origines dans les anciennes civilisations de l'Inde, de la
                Chine et de la Grèce 🏺. On estime qu'elle est pratiquée depuis
                plus de 4 000 ans. En Inde, elle est liée à l'astrologie
                védique, tandis qu'en Chine, elle était intégrée à la médecine
                traditionnelle 🧘‍♂️. Aristote, philosophe grec du IVe siècle av.
                J.-C., mentionnait déjà la chiromancie dans ses écrits 📜,
                affirmant que les lignes de la main reflétaient le caractère et
                le destin. Cette pratique a ensuite été popularisée en Europe par
                des savants comme Paracelse au XVIe siècle 🕰️. Scientifiquement,
                la chiromancie repose sur l'observation des plis et formes des
                mains, bien que son efficacité soit considérée comme subjective
                et non prouvée 🧪. Cependant, elle reste fascinante pour ceux qui
                cherchent à explorer les mystères de la personnalité et de
                l'avenir ✨.
              </>
            ) : (
              <>
                Chiromancy, or the art of reading palm lines ✋, traces its roots
                back to the ancient civilizations of India, China, and Greece
                🏺. It is believed to have been practiced for over 4,000 years.
                In India, it is linked to Vedic astrology, while in China, it was
                integrated into traditional medicine 🧘‍♂️. Aristotle, a Greek
                philosopher of the 4th century BC, mentioned chiromancy in his
                writings 📜, stating that the lines of the hand reflect character
                and destiny. This practice was popularized in Europe by scholars
                like Paracelsus in the 16th century 🕰️. Scientifically,
                chiromancy is based on observing the folds and shapes of the
                hands, though its effectiveness remains subjective and
                unproven 🧪. Still, it continues to captivate those seeking to
                uncover the mysteries of personality and destiny ✨.
              </>
            )}
          </p>
        </div>
      </section>

      {/* MODAL : Caméra pour prendre une photo */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-2xl">
            <h2
              className="text-2xl mb-4"
              style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              {language === 'fr'
                ? 'Prendre une Photo 📷'
                : 'Take a Photo 📷'}
            </h2>
            <video ref={videoRef} className="w-full h-auto rounded-lg" autoPlay muted />
            <div className="flex justify-between mt-4">
              <button
                onClick={handleCapturePhoto}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 mr-2"
                style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                {language === 'fr' ? 'Capturer 📸' : 'Capture 📸'}
              </button>
              <button
                onClick={handleCloseCamera}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
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
