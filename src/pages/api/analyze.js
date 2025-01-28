// src/pages/api/analyze.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { birthDate, gender, language, description } = req.body;

  if (!birthDate || !gender || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // Function to determine astrological sign
  const getAstrologicalSign = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return 'Aquarius ♒';
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      return 'Pisces ♓';
    } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return 'Aries ♈';
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return 'Taurus ♉';
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return 'Gemini ♊';
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return 'Cancer ♋';
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return 'Leo ♌';
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return 'Virgo ♍';
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return 'Libra ♎';
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return 'Scorpio ♏';
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return 'Sagittarius ♐';
    } else {
      return 'Capricorn ♑';
    }
  };

  const birthDateObj = new Date(birthDate);
  const astrologicalSign = getAstrologicalSign(birthDateObj);

  const systemMessage = language === 'fr'
    ? 'Vous êtes un assistant utile spécialisé en chiromancie. Veuillez fournir une analyse complète et détaillée sans utiliser de caractères spéciaux tels que **, ###, etc. Ajoutez des emojis tout au long de l\'analyse et intégrez le signe astrologique de l\'utilisateur. Assurez-vous que toutes les lignes de la main et les monts sont cités et interprétés.'
    : 'You are a helpful assistant specialized in chiromancy. Please provide a complete and detailed analysis without using special characters like **, ###, etc. Add emojis throughout the analysis and incorporate the user\'s astrological sign. Ensure that all the hand lines and mounts are mentioned and interpreted.';

  const userContent = language === 'fr'
    ? `
Voici la description de ma main: ${description}
Mon signe astrologique est: ${astrologicalSign}

Tâche 1: Fournis une description précise et détaillée de ma main basée sur les informations fournies, en incluant toutes les lignes de la main et les monts.

Tâche 2: En tant que spécialiste bienveillant de la chiromancie, analyse ma personnalité et donne des conseils personnalisés basés sur les caractéristiques de ma main et mon signe astrologique.
`
    : `
Here is the description of my hand: ${description}
My astrological sign is: ${astrologicalSign}

Task 1: Provide a precise and detailed description of my hand based on the provided information, including all the lines and mounts.

Task 2: As a compassionate chiromancy specialist, analyze my personality and give personalized advice based on the characteristics of my hand and my astrological sign.
`;

  const messages = [
    {
      role: 'system',
      content: systemMessage,
    },
    {
      role: 'user',
      content: userContent,
    },
  ];

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'pixtral-12b-2409',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Mistral API:', errorData);
      return res.status(500).json({ error: 'Error from Mistral API' });
    }

    const data = await response.json();

    let analysis = data.choices[0].message.content.trim();

    // Remove markdown characters
    analysis = analysis.replace(/###|####|\*\*/g, '');

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error('Error processing analysis:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
