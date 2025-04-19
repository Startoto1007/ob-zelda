import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js'; // Commande prestige
import memberJoin from './events/memberJoin.js'; // Événement de bienvenue (correction du nom)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Quand le bot est prêt, on enregistre les commandes
client.once('ready', async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  // Enregistrer les commandes globalement
  await client.application.commands.set([prestigeCommand]);
  console.log('Commandes enregistrées!');
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
