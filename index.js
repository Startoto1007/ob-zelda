import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js'; // Commande prestige
import memberJoin from './events/memberJoin.js'; // Événement de bienvenue
import scheduledMessages from './events/scheduledMessages.js'; // Messages planifiés
// import setupWebServer from './webServer.js'; // Serveur web (supprimé)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
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

  // Mettre en place le serveur web (supprimé)
  // setupWebServer(client);
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
