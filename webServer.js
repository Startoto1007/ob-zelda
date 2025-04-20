import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { EmbedBuilder } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function setupWebServer(client) {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));

  // Route pour la page d'accueil
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // API endpoint pour envoyer un embed
  app.post('/api/send-embed', async (req, res) => {
    try {
      const { channelId, embedData } = req.body;

      // Vérifier que le salon existe
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        return res.status(404).json({ success: false, message: 'Salon introuvable' });
      }

      // Création de l'embed
      const embed = new EmbedBuilder();

      // Configurer les propriétés de l'embed
      if (embedData.title) embed.setTitle(embedData.title);
      if (embedData.description) embed.setDescription(embedData.description);
      if (embedData.color) embed.setColor(embedData.color);
      if (embedData.image) embed.setImage(embedData.image);
      if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail);

      // Author
      if (embedData.author && embedData.author.name) {
        embed.setAuthor({
          name: embedData.author.name,
          iconURL: embedData.author.iconURL || null
        });
      }

      // Envoyer l'embed
      await channel.send({ embeds: [embed] });

      res.json({ success: true, message: 'Embed envoyé avec succès!' });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'embed:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'embed' });
    }
  });

  // Démarrer le serveur
  app.listen(PORT, () => {
    console.log(`Serveur web démarré sur le port ${PORT}`);
  });

  return app;
}
