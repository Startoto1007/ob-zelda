import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js'; // Import de la commande prestige
import memberJoins from './events/memberJoins.js'; // Événement de bienvenue

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Quand le bot est prêt, enregistres les commandes
client.once('ready', async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);

  // Enregistrer les commandes globalement
  await client.application.commands.set([prestigeCommand]);

  console.log("Commandes enregistrées !");
});

// Événement lorsque le bot reçoit un membre
client.on('guildMemberAdd', memberJoins);

// Pour l'exécution de la commande /prestige
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'prestige') {
    await prestigeExecute(interaction);
  }
});

// Connexion avec le token
client.login(process.env.DISCORD_TOKEN);
