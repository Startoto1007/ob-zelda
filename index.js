import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
config();

// Récupérer le chemin du fichier et du répertoire
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer une instance de client Discord
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ]
});

client.commands = new Collection();

// Charger toutes les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`./commands/${file}`);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[AVERTISSEMENT] La commande ${file} est invalide.`);
  }
}

// Lancer le bot
client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  
  // Définir le statut d'activité
  client.user.setActivity("Créé par l'OB Zelda", { type: 2 });

  // Nettoyer les anciennes commandes
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    const applicationId = client.user.id;
    await rest.put(
      Routes.applicationCommands(applicationId),
      { body: [] } // Vide = suppression de toutes les commandes globales
    );
    console.log('Toutes les anciennes commandes ont été supprimées !');
  } catch (error) {
    console.error('Erreur lors de la suppression des commandes :', error);
  }

  // Réenregistrer les nouvelles commandes
  const commands = [];
  for (const command of client.commands.values()) {
    commands.push(command.data.toJSON());
  }

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Commandes mises à jour avec succès !');
  } catch (error) {
    console.error('Erreur lors de l’enregistrement des commandes :', error);
  }
});

// Gérer les interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Erreur lors de l’exécution de la commande:', error);
    await interaction.reply({ content: 'Désolé, une erreur est survenue!', ephemeral: true });
  }
});

// Se connecter au bot
client.login(process.env.DISCORD_TOKEN);
