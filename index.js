import express from 'express';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js';
import { data as moderationCommands, execute as moderationExecute } from './commands/moderationCommands.js';
import memberJoin from './events/memberJoin.js';
import scheduledMessages from './events/scheduledMessages.js';
import { handleMessageCreate as handleMessagePub } from './events/messagePub.js';
import { handleMessageCreate as handleVocabularyModeration } from './events/vocabularyModeration.js';

// --- Serveur web Express ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Bot OB Zelda en ligne (web)');
});

app.get('/auth/callback', (req, res) => {
  res.send('✅ Callback OAuth2 reçu !');
});

app.listen(PORT, () => {
  console.log(`🌐 Serveur web actif sur http://localhost:${PORT}`);
});

// --- Bot Discord ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.once('ready', async () => {
  console.log(`🤖 Bot connecté en tant que ${client.user.tag}`);
  client.user.setActivity('Créé par l\'OB Zelda', { type: ActivityType.Listening });

  await client.application.commands.set([
    prestigeCommand, 
    moderationCommands
  ]);
  console.log('✅ Commandes enregistrées !');

  scheduledMessages(client);

  setInterval(async () => {
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return;

    const members = await guild.members.fetch();
    members.forEach(async member => {
      const hasRequiredRoles = [
        '1366003918903050240',
        '1366003499711594567',
        '1363773586195611769',
      ].some(roleId => member.roles.cache.has(roleId));

      const roleId = '1366051887190642799';
      if (hasRequiredRoles && member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
      } else if (!hasRequiredRoles && !member.roles.cache.has(roleId)) {
        await member.roles.add(roleId);
      }
    });
  }, 60000);
});

memberJoin(client);

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    switch (interaction.commandName) {
      case 'prestige':
        await prestigeExecute(interaction);
        break;
      case 'moderation':
        await moderationExecute(interaction);
        break;
    }
  } catch (error) {
    console.error(`❌ Erreur dans la commande ${interaction.commandName}:`, error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Une erreur est survenue lors de l\'exécution de cette commande.',
        ephemeral: true
      });
    }
  }
});

client.on('messageCreate', async (message) => {
  await handleMessagePub(message);
  await handleVocabularyModeration(message);
});

client.login(process.env.DISCORD_TOKEN);
