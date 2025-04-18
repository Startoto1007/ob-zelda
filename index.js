import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`🤖 Bot en ligne : ${client.user.tag}`);
});

// Tu pourras ajouter tes futures commandes ici

client.login(process.env.DISCORD_TOKEN);
