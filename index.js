import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { createRequire } from 'module';

// Chargement des variables d'environnement
config();

const require = createRequire(import.meta.url);

// Création du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
});

// Importer les commandes
import { commands as prestigeCommands } from './commands/prestiges.js';

// Initialiser les collections de commandes
client.commands = new Collection();

// Ajouter les commandes à la collection
client.commands.set(prestigeCommands.data.name, prestigeCommands);

// Charger les événements
import memberJoins from './events/memberJoins.js';
memberJoins(client); // Assure-toi que l'événement guildMemberAdd fonctionne

// Quand le client est prêt
client.once('ready', () => {
  console.log(`${client.user.tag} est prêt !`);
});

// Commandes : gérer les interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Il y a eu une erreur en exécutant cette commande.', ephemeral: true });
  }
});

// Connexion avec le token du bot
client.login(process.env.TOKEN);
