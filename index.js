import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js';
import { data as moderationCommands, execute as moderationExecute } from './commands/moderationCommands.js';
import { data as giveawayCommands, execute as giveawayExecute } from './commands/giveawayCommands.js';
import { data as musiquePlayCommand, execute as musiquePlayExecute } from './commands/musiquePlay.js';
import memberJoin from './events/memberJoin.js';
import scheduledMessages from './events/scheduledMessages.js';
import { handleMessageCreate as handleMessagePub } from './events/messagePub.js';
import { handleMessageCreate as handleVocabularyModeration } from './events/vocabularyModeration.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
  ],
});

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://startoto1007.github.io',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get('/channels', async (req, res) => {
  if (!client.isReady()) return res.status(503).json({ error: 'Le bot n\'est pas encore prêt.' });

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return res.status(404).json({ error: 'Serveur introuvable.' });

  const channels = guild.channels.cache
    .filter(channel => channel.type === 0) // GUILD_TEXT
    .map(channel => ({ id: channel.id, name: channel.name }));

  res.json(channels);
});

app.post('/send-embed', async (req, res) => {
  const { token, channelId, embed } = req.body;
  if (token !== process.env.PANEL_TOKEN) return res.status(401).json({ error: 'Token invalide.' });

  const channel = client.channels.cache.get(channelId);
  if (!channel) return res.status(404).json({ error: 'Salon introuvable.' });

  try {
    await channel.send({ embeds: [embed] });
    res.json({ success: true, message: 'Embed envoyé avec succès!' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'embed:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'embed.' });
  }
});

app.post('/start-giveaway', async (req, res) => {
  const { token, channelId, giveaway } = req.body;
  if (token !== process.env.PANEL_TOKEN) return res.status(401).json({ error: 'Token invalide.' });

  const channel = client.channels.cache.get(channelId);
  if (!channel) return res.status(404).json({ error: 'Salon introuvable.' });

  try {
    const embed = new EmbedBuilder()
      .setTitle('🎉 Nouveau Giveaway !')
      .setDescription(`Gagnez **${giveaway.prize}**\nNombre de gagnants : **${giveaway.winnerCount}**\nDurée : **${giveaway.duration.value} ${giveaway.duration.unit}**`)
      .setColor(giveaway.color)
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('participate')
          .setLabel('Participer')
          .setStyle(ButtonStyle.Primary)
      );

    const message = await channel.send({ embeds: [embed], components: [row] });

    const collector = message.createMessageComponentCollector({ time: giveaway.duration.value * 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'participate') {
        await i.reply({ content: 'Vous avez participé au giveaway !', ephemeral: true });
      }
    });

    collector.on('end', async collected => {
      const winners = collected.users.map(user => user).sort(() => 0.5 - Math.random()).slice(0, giveaway.winnerCount);
      const winnersEmbed = new EmbedBuilder()
        .setTitle('🎉 Résultats du Giveaway !')
        .setDescription(`Félicitations :\n${winners.map(w => `- ${w.tag}`).join('\n')}`)
        .setColor(giveaway.color)
        .setTimestamp();

      await channel.send({ embeds: [winnersEmbed] });
    });

    res.json({ success: true, message: 'Giveaway démarré avec succès!' });
  } catch (error) {
    console.error('Erreur lors du démarrage du giveaway:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage du giveaway.' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur web démarré sur le port ${PORT}`);
});

client.once('ready', async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  client.user.setActivity('Créé par l\'OB Zelda', { type: ActivityType.Listening });

  await client.application.commands.set([
    prestigeCommand,
    moderationCommands,
    giveawayCommands,
    musiquePlayCommand
  ]);

  console.log('Commandes enregistrées!');
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

      if (hasRequiredRoles) {
        if (member.roles.cache.has('1366051887190642799')) {
          await member.roles.remove('1366051887190642799');
        }
      } else {
        if (!member.roles.cache.has('1366051887190642799')) {
          await member.roles.add('1366051887190642799');
        }
      }
    });
  }, 60000);
});

memberJoin(client);

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'prestige') {
    await prestigeExecute(interaction);
  } else if (interaction.commandName === 'moderation') {
    await moderationExecute(interaction);
  } else if (interaction.commandName === 'giveaway') {
    await giveawayExecute(interaction);
  } else if (interaction.commandName === 'jouer-musique') {
    await musiquePlayExecute(interaction);
  }
});

client.on('messageCreate', async (message) => {
  await handleMessagePub(message);
  await handleVocabularyModeration(message);
});

client.login(process.env.DISCORD_TOKEN);
