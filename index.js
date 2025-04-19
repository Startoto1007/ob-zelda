import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { deployCommands } from './deploy-commands.js';
import memberJoins from './events/memberJoins.js';  // Importer le fichier d'événement

config(); // Charger les variables d'environnement

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();

// Charger les commandes
import { commands } from './commands/index.js'; // Assurez-vous d'importer toutes les commandes
commands.forEach(command => {
  client.commands.set(command.data.name, command);
});

// Gestion de l'événement 'guildMemberAdd'
memberJoins(client);  // S'assurer que l'événement 'memberJoin' est bien géré

client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
