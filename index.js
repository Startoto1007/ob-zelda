import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import memberJoins from './events/memberJoins.js';  // Import de l'événement

config();  // Charger les variables d'environnement

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Charger les commandes depuis le dossier "commands"
import { readdirSync } from 'fs';
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Événements personnalisés
memberJoins(client);

client.on('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Il y a eu une erreur lors de l\'exécution de la commande.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);  // Connexion à Discord avec le token
