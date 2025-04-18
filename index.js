import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import memberJoin from './events/memberJoin.js'; // Importation de l'événement

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] // On ajoute l'intent pour les membres
});

client.once('ready', () => {
  console.log(`🤖 Bot en ligne : ${client.user.tag}`);
});

// Enregistrement de l'événement de bienvenue
memberJoin(client);

client.login(process.env.DISCORD_TOKEN);
