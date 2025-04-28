import { EmbedBuilder } from 'discord.js';
import { setTimeout } from 'timers/promises';
import { addSanctionToHistory, checkCumulativeSanctions } from '../utils/sanctionHistory.js'; // Assurez-vous d'avoir ce fichier pour gérer l'historique des sanctions

// Liste des gros mots à surveiller
const BAD_WORDS = ['grosmot1', 'grosmot2', 'grosmot3']; // Remplacez par les mots que vous souhaitez surveiller

export const handleMessageCreate = async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const badWordsDetected = BAD_WORDS.some(word => content.includes(word));

  if (badWordsDetected) {
    const member = message.guild.members.cache.get(message.author.id);
    const warnings = member.warnings || 0;

    // Incrémenter le nombre d'avertissements
    member.warnings = warnings + 1;

    // Envoyer un avertissement
    const warningEmbed = new EmbedBuilder()
      .setTitle('Avertissement automatique')
      .setDescription('Attention à votre langage.')
      .setColor(0xff0000);

    await message.author.send({ embeds: [warningEmbed], ephemeral: true }).catch(() => {});

    // Ajouter à l'historique des sanctions
    await addSanctionToHistory(member.id, 'Avertissement', 'N/A', 'Langage inapproprié', message.author);

    // Vérifier les sanctions cumulées
    await checkCumulativeSanctions(member.id, message);
  }
};
