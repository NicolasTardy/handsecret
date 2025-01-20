// src/components/Layout.tsx

import { useState, createContext, useContext, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [language, setLanguage] = useState('fr');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {/* Header with Language Switcher */}
      <header className="absolute top-4 right-4 z-50 flex space-x-2">
        <button onClick={() => handleLanguageChange('fr')} className="flex items-center">
          <Image src="/images/fr-flag.png" alt="Français" width={24} height={16} />
          <span className="ml-1">FR</span>
        </button>
        <button onClick={() => handleLanguageChange('en')} className="flex items-center">
          <Image src="/images/en-flag.png" alt="English" width={24} height={16} />
          <span className="ml-1">EN</span>
        </button>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
          <Link href="/terms" className="text-sm hover:underline">
            {language === 'fr' ? 'Consulter les conditions générales de vente 📜' : 'View Terms and Conditions 📜'}
          </Link>
        </div>
      </footer>
    </LanguageContext.Provider>
  );
};

export default Layout;
