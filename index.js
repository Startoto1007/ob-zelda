import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js'; // Commande prestige
import { data as moderationCommands, execute as moderationExecute } from './commands/moderationCommands.js'; // Commandes de modération
import { data as giveawayCommands, execute as giveawayExecute } from './commands/giveawayCommands.js'; // Commandes de giveaway
import memberJoin from './events/memberJoin.js'; // Événement de bienvenue
import scheduledMessages from './events/scheduledMessages.js'; // Messages planifiés
import { handleMessageCreate } from './events/messagePub.js'; // Vérification des messages de pub
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

// Configuration CORS
const corsOptions = {
  origin: 'https://startoto1007.github.io', // Remplacez par votre domaine GitHub Pages
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Route pour récupérer la liste des salons
app.get('/channels', async (req, res) => {
  if (!client.isReady()) {
    return res.status(503).json({ error: 'Le bot n\'est pas encore prêt.' });
  }

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) {
    return res.status(404).json({ error: 'Serveur introuvable.' });
  }

  const channels = guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').map(channel => ({
    id: channel.id,
    name: channel.name,
  }));

  res.json(channels);
});

// Route pour envoyer un embed via le bot
app.post('/send-embed', async (req, res) => {
  const { token, channelId, embed } = req.body;

  if (token !== process.env.PANEL_TOKEN) {
    return res.status(401).json({ error: 'Token invalide.' });
  }

  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    return res.status(404).json({ error: 'Salon introuvable.' });
  }

  try {
    await channel.send({ embeds: [embed] });
    res.json({ success: true, message: 'Embed envoyé avec succès!' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'embed:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'embed.' });
  }
});

// Route pour démarrer un giveaway
app.post('/start-giveaway', async (req, res) => {
  const { token, channelId, giveaway } = req.body;

  if (token !== process.env.PANEL_TOKEN) {
    return res.status(401).json({ error: 'Token invalide.' });
  }

  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    return res.status(404).json({ error: 'Salon introuvable.' });
  }

  try {
    const embed = new EmbedBuilder()
      .setTitle('🎉 Nouveau Giveaway !')
      .setDescription(`Gagnez **${giveaway.prize}** en participant au giveaway !\nNombre de gagnants : **${giveaway.winnerCount}**\nDurée : **${giveaway.duration.value} ${giveaway.duration.unit}**`)
      .setColor(giveaway.color)
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('participer')
          .setLabel('Participer')
          .setStyle(ButtonStyle.Primary)
      );

    const message = await channel.send({ embeds: [embed], components: [row] });

    const collector = message.createMessageComponentCollector({ time: giveaway.duration.value * 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'participer') {
        await i.reply({ content: 'Vous avez participé au giveaway !', ephemeral: true });
      }
    });

    collector.on('end', async collected => {
      const winners = collected.users.filter(user => !collected.users.some(other => other.id === user.id));
      const selectedWinners = winners.sort(() => 0.5 - Math.random()).slice(0, giveaway.winnerCount);

      const winnersEmbed = new EmbedBuilder()
        .setTitle('🎉 Résultats du Giveaway !')
        .setDescription(`Félicitations aux gagnants :\n${selectedWinners.map(winner => `- ${winner.tag}`).join('\n')}`)
        .setColor(giveaway.color)
        .setTimestamp();

      await channel.send({ embeds: [winnersEmbed] });
    });

    res.json({ success: true, message: 'Giveaway démarré avec succès!' });
  } catch (error) {
    console.error('Erreur lors du démarrage du giveaway:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage du giveaway.' });
  }
});

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

// Gestionnaire d'événements pour les messages
client.on('messageCreate', async (message) => {
  await handleMessageCreate(message);
});

// Connexion avec le token
client.login(process.env.DISCORD_TOKEN);
