import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js'; // Commande prestige
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

app.use(cors());
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

  if (token !== process.env.BOT_TOKEN) {
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

app.listen(PORT, () => {
  console.log(`Serveur web démarré sur le port ${PORT}`);
});

// Quand le bot est prêt, on enregistre les commandes et définit le statut
client.once('ready', async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);

  // Définir le statut d'activité
  client.user.setActivity('Créé par l\'OB Zelda', { type: ActivityType.Listening });

  // Enregistrer les commandes globalement
  await client.application.commands.set([prestigeCommand]);
  console.log('Commandes enregistrées!');

  // Initialiser les messages planifiés
  scheduledMessages(client);
});

// Initialiser l'événement de bienvenue
memberJoin(client);

// Exécution des commandes (ici, pour /prestige)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === 'prestige') {
    await prestigeExecute(interaction);
  }
});

// Connexion avec le token
client.login(process.env.DISCORD_TOKEN);
