import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import { data as prestigeCommand } from './commands/prestiges.js';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Suppression des anciennes commandes (globales)...');
    await rest.put(
      Routes.applicationCommands('1357762980497981731'), // ID de l'application
      { body: [] },
    );
    console.log('✅ Commandes supprimées !');
    
    // Déployer les nouvelles commandes
    const newCommands = [prestigeCommand.toJSON()];
    await rest.put(
      Routes.applicationCommands('1357762980497981731'),
      { body: newCommands },
    );
    console.log('✅ Nouvelles commandes déployées !');
  } catch (error) {
    console.error(error);
  }
})();
