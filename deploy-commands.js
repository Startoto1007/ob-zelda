import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

config();

const commands = [];
const commandsPath = path.join(process.cwd(), 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[AVERTISSEMENT] La commande à ${filePath} est invalide.`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('🔄 Mise à jour des commandes slash...');
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID), // Pour les commandes globales
    { body: commands }
  );
  console.log('✅ Commandes enregistrées avec succès !');
} catch (error) {
  console.error('❌ Erreur en enregistrant les commandes :', error);
}
