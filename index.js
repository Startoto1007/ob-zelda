import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

client.commands = new Collection();

// 🔁 Chargement dynamique des events depuis le dossier "events"
const eventsPath = path.resolve('./events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = (await import(filePath)).default;
  event(client);
}

// ✅ Le bot est prêt
client.once('ready', () => {
  console.log(`✅ Bot en ligne : ${client.user.tag}`);

  // 🟣 Statut visible sur Discord
  client.user.setActivity("Créé par l'OB Zelda", { type: 2 }); // Type 2 = Listening
});

client.login(process.env.DISCORD_TOKEN);
