import { EmbedBuilder } from 'discord.js';
import { addSanctionToHistory, checkCumulativeSanctions } from '../utils/sanctionHistory.js';

// Liste des gros mots à surveiller
const BAD_WORDS = ['grosmot1', 'grosmot2', 'grosmot3']; // Remplacez par les mots que vous souhaitez surveiller

/**
 * Gère la détection des gros mots dans les messages
 * @param {Object} message - Le message Discord
 * @returns {Promise<void>}
 */
export const handleMessageCreate = async (message) => {
  // Ignorer les messages des bots
  if (message.author.bot) return;
  
  const content = message.content.toLowerCase();
  const badWordsDetected = BAD_WORDS.some(word => content.includes(word));
  
  if (badWordsDetected) {
    try {
      // Récupérer le membre
      const member = message.guild.members.cache.get(message.author.id);
      if (!member) return;
      
      // Supprimer le message contenant le mot inapproprié
      await message.delete().catch(err => console.error('Impossible de supprimer le message:', err));
      
      // Créer l'embed d'avertissement
      const warningEmbed = new EmbedBuilder()
        .setTitle('Avertissement automatique')
        .setDescription('Attention à votre langage.')
        .setColor(0xff0000)
        .setTimestamp();
      
      // Envoyer l'avertissement en DM
      await message.author.send({ embeds: [warningEmbed] }).catch(async () => {
        // Si l'envoi en DM échoue, envoyer dans le canal
        const reply = await message.channel.send({ 
          content: `${message.author}, `,
          embeds: [warningEmbed] 
        });
        
        // Supprimer le message d'avertissement après 10 secondes
        setTimeout(() => {
          reply.delete().catch(() => {});
        }, 10000);
      });
      
      // Ajouter à l'historique des sanctions
      await addSanctionToHistory(
        member.id, 
        'Avertissement', 
        'N/A', 
        'Langage inapproprié (détection automatique)', 
        { tag: 'AutoMod' } // Simuler un modérateur
      );
      
      // Envoyer une notification aux modérateurs
      const modChannel = message.guild.channels.cache.get('1349788945554079784');
      if (modChannel) {
        const modEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('Action de modération automatique: Avertissement')
          .addFields(
            { name: 'Modérateur', value: 'AutoMod', inline: true },
            { name: 'Membre', value: message.author.tag, inline: true },
            { name: 'Durée', value: 'N/A', inline: true },
            { name: 'Raison', value: 'Langage inapproprié (détection automatique)' }
          )
          .setTimestamp();
        
        await modChannel.send({ embeds: [modEmbed] });
      }
      
      // Vérifier les sanctions cumulées
      await checkCumulativeSanctions(member.id, message);
      
    } catch (error) {
      console.error('Erreur lors du traitement du message avec langage inapproprié:', error);
    }
  }
};
