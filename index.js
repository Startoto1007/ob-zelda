import { Client, GatewayIntentBits, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js'; // Commande prestige
import { data as moderationCommands, execute as moderationExecute } from './commands/moderationCommands.js'; // Commandes de modération
import { data as giveawayCommands, execute as giveawayExecute } from './commands/giveawayCommands.js'; // Commandes de giveaway
import memberJoin from './events/memberJoin.js'; // Événement de bienvenue
import scheduledMessages from './events/scheduledMessages.js'; // Messages planifiés
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS avec domaines autorisés
const corsOptions = {
  origin: ['https://startoto1007.github.io', 'http://localhost:3000', 'http://127.0.0.1:5500'], 
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Route de vérification API
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'API du bot OB Zelda opérationnelle' });
});

// Route pour récupérer la liste des salons
app.get('/channels', async (req, res) => {
  if (!client.isReady()) {
    return res.status(503).json({ error: 'Le bot n\'est pas encore prêt.' });
  }

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) {
    return res.status(404).json({ error: 'Serveur introuvable.' });
  }

  try {
    // Discord.js v14+ utilise des constantes numériques pour les types de canaux
    // 0 représente GUILD_TEXT (salon textuel)
    const channels = guild.channels.cache
      .filter(channel => channel.type === 0)
      .map(channel => ({
        id: channel.id,
        name: channel.name,
      }));

    res.json(channels);
  } catch (error) {
    console.error('Erreur lors de la récupération des canaux:', error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// Route pour envoyer un embed via le bot
app.post('/send-embed', async (req, res) => {
  const { token, channelId, embed } = req.body;

  // Vérification du token d'authentification
  if (token !== process.env.PANEL_TOKEN) {
    return res.status(401).json({ error: 'Token d\'authentification invalide.' });
  }

  // Vérification du canal
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    return res.status(404).json({ error: 'Salon introuvable.' });
  }

  try {
    // Envoi de l'embed
    await channel.send({ embeds: [embed] });
    console.log(`Embed envoyé au salon ${channel.name} (${channelId})`);
    res.json({ success: true, message: 'Embed envoyé avec succès!' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'embed:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'embed.', details: error.message });
  }
});

// Route pour démarrer un giveaway
app.post('/start-giveaway', async (req, res) => {
  const { token, channelId, giveaway } = req.body;

  // Vérification du token d'authentification
  if (token !== process.env.PANEL_TOKEN) {
    return res.status(401).json({ error: 'Token d\'authentification invalide.' });
  }

  // Vérification du canal
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    return res.status(404).json({ error: 'Salon introuvable.' });
  }

  try {
    // Création de l'embed pour le giveaway
    const embed = new EmbedBuilder()
      .setTitle('🎉 Nouveau Giveaway !')
      .setDescription(`Gagnez **${giveaway.prize}** en participant au giveaway !\nNombre de gagnants : **${giveaway.winnerCount}**\nDurée : **${giveaway.duration.value} ${giveaway.duration.unit}**`)
      .setColor(parseInt(giveaway.color.replace('#', ''), 16) || 0x5a7c46)
      .setTimestamp();

    // Création du bouton pour participer
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('participer')
          .setLabel('Participer')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎉')
      );

    // Envoyer le message de giveaway
    const message = await channel.send({ embeds: [embed], components: [row] });
    
    // Calculer la durée en millisecondes
    let durationMs = giveaway.duration.value;
    if (giveaway.duration.unit === 'minutes') {
      durationMs *= 60000;
    } else if (giveaway.duration.unit === 'heures') {
      durationMs *= 3600000;
    } else if (giveaway.duration.unit === 'jours') {
      durationMs *= 86400000;
    }

    // Liste des participants
    const participants = new Set();
    
    // Créer un collecteur pour les interactions avec le bouton
    const collector = message.createMessageComponentCollector({ 
      time: durationMs 
    });

    // Quand un utilisateur clique sur le bouton
    collector.on('collect', async i => {
      if (i.customId === 'participer') {
        participants.add(i.user.id);
        await i.reply({ content: 'Vous avez participé au giveaway !', ephemeral: true });
      }
    });

    // Quand le temps est écoulé
    collector.on('end', async () => {
      // Convertir le Set en tableau et mélanger
      const participantsArray = Array.from(participants);
      const winners = [];
      
      // Sélectionner les gagnants aléatoirement
      for (let i = 0; i < Math.min(giveaway.winnerCount, participantsArray.length); i++) {
        const randomIndex = Math.floor(Math.random() * participantsArray.length);
        const selectedId = participantsArray.splice(randomIndex, 1)[0];
        winners.push(`<@${selectedId}>`);
      }

      // Créer l'embed des résultats
      const winnersEmbed = new EmbedBuilder()
        .setTitle('🎉 Résultats du Giveaway !')
        .setDescription(winners.length > 0 
          ? `Félicitations aux gagnants :\n${winners.join('\n')}` 
          : "Personne n'a participé au giveaway...")
        .setColor(parseInt(giveaway.color.replace('#', ''), 16) || 0x5a7c46)
        .setTimestamp();

      // Envoyer les résultats
      await channel.send({ embeds: [winnersEmbed] });
    });

    console.log(`Giveaway démarré dans le salon ${channel.name} (${channelId})`);
    res.json({ success: true, message: 'Giveaway démarré avec succès!' });
  } catch (error) {
    console.error('Erreur lors du démarrage du giveaway:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage du giveaway.', details: error.message });
  }
});

// Démarrer le serveur web
app.listen(PORT, () => {
  console.log(`Serveur web démarré sur le port ${PORT}`);
});

// Quand le bot est prêt, on enregistre les commandes et définit le statut
client.once('ready', async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);

  // Définir le statut d'activité
  client.user.setActivity('Créé par l\'OB Zelda', { type: ActivityType.Listening });

  // Enregistrer les commandes globalement
  await client.application.commands.set([prestigeCommand, moderationCommands, giveawayCommands]);
  console.log('Commandes enregistrées!');

  // Initialiser les messages planifiés
  scheduledMessages(client);
});

// Initialiser l'événement de bienvenue
memberJoin(client);

// Exécution des commandes (ici, pour /prestige, /moderation et /giveaway)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;
  if (commandName === 'prestige') {
    await prestigeExecute(interaction);
  } else if (commandName === 'moderation') {
    await moderationExecute(interaction);
  } else if (commandName === 'giveaway') {
    await giveawayExecute(interaction);
  }
});

// Connexion avec le token
client.login(process.env.DISCORD_TOKEN);
