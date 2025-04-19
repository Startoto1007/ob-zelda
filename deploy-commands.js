import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Suppression des anciennes commandes (globales)...');

    const commands = await rest.put(
      Routes.applicationCommands('1357762980497981731'), // ID de l'application
      { body: [] },
    );

    console.log('✅ Commandes supprimées !');

    // Déployer les nouvelles commandes
    const newCommands = [ /* Les nouvelles commandes ici */ ];
    await rest.put(
      Routes.applicationCommands('1357762980497981731'),
      { body: newCommands },
    );

    console.log('✅ Nouvelles commandes déployées !');
  } catch (error) {
    console.error(error);
  }
})();
