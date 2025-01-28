export default function LanguageSwitcher({ language, setLanguage }) {
    return (
      <div className="absolute top-4 right-4 z-50">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="p-2 rounded bg-white shadow"
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
      </div>
    );
  }