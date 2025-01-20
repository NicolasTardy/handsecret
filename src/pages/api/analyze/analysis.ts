// src/pages/api/analyze/analysis.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: true,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { description, birthDate, gender } = req.body;

  if (!description || !birthDate || !gender) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const secondPrompt = `
En te basant sur la description suivante de la main et en tant que expert en Chiromancie, en astrologie et psychologie :

"${description}"

Prends également en compte les informations suivantes renseignées par l'utilisateur pour l'interprétation générale :
- Date de naissance : ${birthDate}
- Genre : ${gender === 'male' ? 'Homme' : gender === 'female' ? 'Femme' : 'Autre'}

Rédige maintenant une analyse approfondie de la personnalité selon la chiromancie en évitant les caractères spéciaux comme #,##,###,*,**,***. Assure-toi d'exploiter tous les détails déjà fournis. Organise tes points comme suit et ajoute des emojis pour rendre le texte plus vivant :

1️⃣ Forme générale (type élémentaire)
Identifie le type de main (Air, Terre, Feu, Eau, ou combinaison).
Explique ce que le type de main révèle sur la personnalité et les traits dominants.
Analyse l’élasticité des doigts et de la paume pour déterminer l’adaptabilité ou la rigidité de la personne.

2️⃣ Analyse détaillée des doigts : Associe chaque doigt à sa signification chiromantique :
Pouce (force de volonté et logique) : Décris la volonté et la capacité de raisonnement.
Index (Jupiter – ambition et leadership) : Analyse l’ambition et le potentiel de leadership.
Majeur (Saturne – responsabilité et introspection) : Évalue le sens du devoir et l’introspection.
Annulaire (Soleil – créativité et émotion) : Explore la sensibilité artistique et les émotions.
Auriculaire (Mercure – communication et sociabilité) : Interprète les talents de communication et d’adaptabilité sociale.

3️⃣ Reliefs et monts : Analyse l’influence des monts sur les domaines de vie :
Mont de Vénus : Capacité à donner et recevoir de l’amour.
Mont de Jupiter : Niveau d’ambition et d’autorité.
Mont de Saturne : Aptitude à la réflexion et à la sagesse.
Mont de Mercure : Talents en affaires et en communication.
Mont de la Lune : Imagination, intuition et créativité.

4️⃣ Lignes principales et secondaires :
Interprète chaque ligne en détail (ligne de vie, ligne de tête, ligne de cœur, ligne de destin).
Note les lignes secondaires et leurs significations spécifiques.

5️⃣ Résumé spirituel et nuances : Conclus sur les traits dominants de la personnalité, les forces spirituelles, et les domaines d’amélioration potentiels.

6️⃣ Conseils personnalisés : Fournis des suggestions concrètes pour aider la personne à s’épanouir, à maximiser son potentiel et à surmonter ses défis.

Ajoute des emojis tout au long du texte, mais n'utilise pas les caractères spéciaux tels que #,##,###,*,**,***
`;

  try {
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en chiromancie et tu vas approfondir l’analyse.' },
          { role: 'user', content: secondPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return res.status(openAiResponse.status).json({ message: data.error?.message || 'OpenAI API error' });
    }

    const analysis = data.choices[0].message?.content.trim();

    if (!analysis) {
      return res.status(500).json({ message: 'No analysis generated by OpenAI.' });
    }

    res.status(200).json({ analysis });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Internal server error.' });
  }
};

export default handler;
