import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand, execute as prestigeExecute } from './commands/prestiges.js'; // Commande prestige
import { data as moderationCommands, execute as moderationExecute } from './commands/moderationCommands.js'; // Commandes de modération
import { data as giveawayCommands, execute as giveawayExecute } from './commands/giveawayCommands.js'; // Commandes de giveaway
import memberJoin from './events/memberJoin.js'; // Événement de bienvenue
import scheduledMessages from './events/scheduledMessages.js'; // Messages planifiés
import { handleMessageCreate as handleMessagePub } from './events/messagePub.js'; // Vérification des messages de pub
import { handleMessageCreate as handleVocabularyModeration } from './events/vocabularyModeration.js'; // Modération du vocabulaire

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Quand le bot est prêt, on enregistre les commandes et définit le statut
client.once('ready', async () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);

  // Définir le statut d'activité
  client.user.setActivity('Créé par l\'OB Zelda', { type: ActivityType.Listening });

  // Enregistrer les commandes globalement
  await client.application.commands.set([prestigeCommand, moderationCommands, giveawayCommands]);
  console.log('Commandes enregistrées!');

  // Initialiser les messages planifiés
  scheduledMessages(client);

  // Gérer l'attribution et le retrait automatique du rôle
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
  }, 60000); // Vérifier toutes les minutes
});

// Initialiser l'événement de bienvenue
memberJoin(client);

// Exécution des commandes (ici, pour /prestige, /moderation et /giveaway)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;
  if (commandName === 'prestige') {
    await prestigeExecute(interaction);
  } else if (commandName === 'moderation') {
    await moderationExecute(interaction);
  } else if (commandName === 'giveaway') {
    await giveawayExecute(interaction);
  }
});

// Gestionnaire d'événements pour les messages
client.on('messageCreate', async (message) => {
  await handleMessagePub(message);
  await handleVocabularyModeration(message);
});

// Connexion avec le token
client.login(process.env.DISCORD_TOKEN);
