import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Suppression des anciennes commandes (globales)...');

    const commands = await rest.put(
      Routes.applicationCommands('TON_CLIENT_ID'),
      { body: [] },
    );

    console.log('✅ Commandes supprimées !');
  } catch (error) {
    console.error(error);
  }
})();
