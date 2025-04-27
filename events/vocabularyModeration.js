import { EmbedBuilder } from 'discord.js';
import { setTimeout } from 'timers/promises';

// Liste des gros mots à surveiller
const BAD_WORDS = ['con', 'chient', 'chier', 'batard', 'fdp', 'merde', 'batard', 'ta mère']; // Remplacez par les mots que vous souhaitez surveiller

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

    // Appliquer les sanctions en fonction du nombre d'avertissements
    if (warnings === 3) {
      await message.member.timeout(3600000, '3 avertissements cumulés'); // 1 heure
    } else if (warnings === 5) {
      await message.member.timeout(86400000, '5 avertissements cumulés'); // 1 jour
    } else if (warnings === 10) {
      await message.member.timeout(604800000, '10 avertissements cumulés'); // 1 semaine
    } else if (warnings === 15) {
      await message.member.timeout(1209600000, '15 avertissements cumulés'); // 2 semaines
    } else if (warnings === 20) {
      await message.member.timeout(2592000000, '20 avertissements cumulés'); // 1 mois
    } else if (warnings === 25) {
      await message.member.timeout(5184000000, '25 avertissements cumulés'); // 2 mois
    } else if (warnings >= 30) {
      await message.member.ban({ reason: '30 avertissements cumulés' }); // Ban définitif
    }

    // Réinitialiser les avertissements tous les mois
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    setTimeout(nextMonth.getTime() - now.getTime(), () => {
      member.warnings = 0;
    });
  }
};
