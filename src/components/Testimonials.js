export default function Testimonials({ language }) {
    const testimonials = [
      {
        text: {
          fr: "Incroyable précision ! L'analyse correspond parfaitement à ma personnalité.",
          en: "Amazing accuracy! The analysis perfectly matches my personality."
        },
        author: "Émilie D."
      },
      // Ajouter d'autres témoignages
    ];
  
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">
          {language === 'fr' ? 'Témoignages' : 'Testimonials'}
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((testi, i) => (
            <div key={i} className="bg-white p-4 rounded shadow">
              <p className="mb-2">"{testi.text[language]}"</p>
              <p className="font-semibold">- {testi.author}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }