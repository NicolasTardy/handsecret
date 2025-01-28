// src/components/ImageUpload.js

import { useState } from 'react';

export default function ImageUpload({ setFormData, language }) {
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setFileName(file.name);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-600 hover:text-white transition duration-300">
        <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M16.88 9.1A4 4 0 0 1 16 17H4a4 4 0 0 1-3.95-3.1A7.5 7.5 0 0 1 5.1 4.05a4 4 0 0 1 7.8 0A7.5 7.5 0 0 1 16.88 9.1zM11 11h3l-4-4-4 4h3v3h2v-3z"/>
        </svg>
        <span className="mt-2 text-base leading-normal">
          {language === 'fr' ? 'Sélectionner une image' : 'Select an image'}
        </span>
        {fileName && (
          <span className="mt-2 text-black text-sm">
            {fileName}
          </span>
        )}
        <input type='file' className="hidden" onChange={handleChange} accept="image/*"/>
      </label>
    </div>
  );
}
