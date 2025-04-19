import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Créer une instance du bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

// L'événement 'ready' qui se déclenche lorsque le bot est en ligne
client.once('ready', () => {
  console.log(`${client.user.tag} est maintenant en ligne !`);
  client.user.setStatus('en ligne');  // Statut du bot
  client.user.setActivity('Créé par l\'OB Zelda', { type: 'PLAYING' });
});

// L'événement 'guildMemberAdd' qui se déclenche lorsqu'un membre rejoint le serveur
import memberJoin from './events/memberJoin.js';
memberJoin(client);

client.login(process.env.DISCORD_TOKEN);  // Utilisation du token depuis les variables d'environnement
