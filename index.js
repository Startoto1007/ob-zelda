import { Client, GatewayIntentBits, Collection } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
});

client.commands = new Collection();

// 📂 Chargement des events (comme guildMemberAdd)
const eventsPath = path.resolve('./events');
fs.readdirSync(eventsPath).forEach(file => {
  const event = await import(`./events/${file}`);
  event.default(client);
});

client.once('ready', () => {
  console.log(`✅ Bot en ligne : ${client.user.tag}`);

  // 👇 Mise à jour du statut
  client.user.setActivity('Créé par l\'OB Zelda', {
    type: 3, // WATCHING
  });
});

client.login(process.env.TOKEN);
