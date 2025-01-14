// src/pages/api/analyze/description.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({
        message: 'Seules les requêtes POST sont autorisées.',
      });
    }

    const form = formidable({
      uploadDir: path.join(process.cwd(), '/public/uploads'),
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024, // Ajuste si nécessaire
      multiples: false,
    });

    form.parse(req, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        console.error('Formidable error:', err);
        return res.status(400).json({
          message: 'Erreur lors du parsing (taille, type, etc.).',
        });
      }

      // Récupère la date de naissance et le genre
      const birthDate = fields.birthDate || ''; 
      const gender = fields.gender || ''; 

      // Vérifie que le champ "photo" existe
      const photo = files.photo;
      if (!photo) {
        return res.status(400).json({
          message: 'Aucune photo trouvée dans le champ "photo".',
        });
      }

      // Gère unique/multiple
      const photoFile = Array.isArray(photo) ? photo[0] : photo;
      const { filepath, mimetype } = photoFile as formidable.File;

      // Vérifie le type MIME
      if (!mimetype || !mimetype.startsWith('image/')) {
        fs.unlink(filepath, () => null);
        return res.status(400).json({
          message: 'Le fichier uploadé doit être une image.',
        });
      }

      // Compression / redimensionnement avec Sharp (optionnel)
      let compressedBuffer: Buffer;
      try {
        compressedBuffer = await sharp(filepath)
          .resize({ width: 800 })
          .jpeg({ quality: 70 })
          .toBuffer();

        // Supprime le fichier temporaire original
        fs.unlink(filepath, () => null);
      } catch (error) {
        console.error('Erreur Sharp:', error);
        return res.status(500).json({
          message: 'Erreur lors de la compression de l\'image.',
        });
      }

      // Construction du data URI complet pour Mistral
      const base64Image = compressedBuffer.toString('base64');
      const imageDataUri = `data:${mimetype};base64,${base64Image}`;

      // Prépare le prompt avec la date de naissance et le genre
      const prompt = `
L'utilisateur a déclaré être de genre : ${gender}
et sa date de naissance est : ${birthDate}

Utilise également ces informations personnelles si cela peut influencer ton analyse. 
Par exemple, si certains aspects de la main peuvent varier selon l'âge ou le genre.

DAnalyse de la main en photo : Décris la main en détail selon les critères suivants :
Taille de la main : Petite, moyenne ou grande par rapport aux objets visibles ou au contexte.
Forme de la paume : Carrée, rectangulaire, trapézoïdale, large ou étroite.
Aspect général : Souple, ferme, osseuse, charnue, fine, etc.
Proportions des doigts par rapport à la paume : Longs, courts, proportionnés.
2️⃣ Détails des doigts :
Longueur des doigts : Quels doigts semblent particulièrement longs ou courts (index, majeur, annulaire, auriculaire) ?
Forme des extrémités : Les bouts des doigts sont-ils arrondis, carrés, pointus, ou en spatule ?
État des phalanges : Articulations marquées ou lisses ?
Écartement des doigts : Serrés ou écartés ?
3️⃣ Reliefs et monts :
Mont de Vénus (base du pouce) : Proéminent, plat ou discret ?
Mont de Jupiter (sous l’index) : Visible ou peu marqué ?
Mont de Saturne (sous le majeur) : Plat, bombé ou absent ?
Mont de Mercure (sous l’auriculaire) : Marqué ou discret ?
Mont de la Lune (base extérieure de la paume) : Ressorti ou peu visible ?
4️⃣ Lignes de la paume :
Ligne de vie : Décris sa trajectoire et son aspect (profonde, longue, fine, brisée, bifurquée, etc.).
Ligne de tête : Décris sa localisation et son aspect (droite, courbe, bien marquée, interrompue, etc.).
Ligne de cœur : Décris son emplacement et sa forme (longue, courte, incurvée, profonde, fragmentée, etc.).
Ligne de destin (si visible) : Décris son parcours et sa nature (continue, interrompue, fine, profonde).
Autres marques : Note les croisements, cercles, fourches, ou motifs particuliers visibles sur la paume.


Voici l'image fournie :
- Format : base64 (préfixe data:image)
- imageDataUri : ${imageDataUri}
      `;

      // Appel à l’API Mistral
      try {
        const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'pixtral-12b-2409',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: prompt,
                  },
                  {
                    type: 'image_url',
                    image_url: imageDataUri,
                  },
                ],
              },
            ],
          }),
        });

        const data = await mistralResponse.json();
        if (!mistralResponse.ok) {
          console.error('Erreur Mistral:', data);
          return res.status(mistralResponse.status).json({
            message: data.error?.message || 'Erreur de l’API Mistral.',
          });
        }

        const description = data?.choices?.[0]?.message?.content?.trim?.();
        if (!description) {
          return res.status(500).json({
            message: 'Aucune description générée par Mistral.',
          });
        }

        return res.status(200).json({
          message: 'Analyse terminée',
          description,
        });
      } catch (errMistral: any) {
        console.error('Erreur fetch Mistral:', errMistral);
        return res.status(500).json({
          message: errMistral.message || 'Erreur interne du serveur.',
        });
      }
    });
  } catch (errGlobal: any) {
    console.error('Erreur globale:', errGlobal);
    return res.status(500).json({
      message: 'Erreur interne du serveur.',
    });
  }
}
