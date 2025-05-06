import { EmbedBuilder } from 'discord.js';
import { addSanctionToHistory, checkCumulativeSanctions } from '../utils/sanctionHistory.js';

// Liste des gros mots à surveiller
const BAD_WORDS = ['abruti', 'idiot', 'stupide', 'connard', 'connasse', 'merde',
  'putain', 'salope', 'enculé', 'nique', 'bordel', 'chiant', 'chiotte',
  'bite', 'couille', 'cul', 'pédé', 'tafiole', 'gouine', 'grognasse',
  'fdp', 'ntm', 'tg', 'ta gueule', 'zizi', 'trouduc', 'encule', 'branleur',
  'salaud', 'pute', 'débile', 'dégueulasse', 'enfoiré', 'casse-toi',
  'bouffon', 'crétin', 'baltringue', 'batard', 'racaille', 'porc', 'p*tain', 'p_tain', 'put1', 'pxtain', 'putain', 'p.tain', 'p*tin',
  'm*rde', 'm3rde', 'merd*', 'm.rde',
  'n*que', 'n1que', 'niq*e', 'niq1e',
  's*lope', 'sal*pe', 's@lope', 's4lope',
  'c*nnard', 'c0nnard', 'conn*rd', 'conna*d',
  'enc*lé', 'encu*é', 'encul3', 'enculé', 'encul*',
  'f*ck', 'f4ck', 'fu*k', 'f.ck', 'f***',
  'b*te', 'b1te', 'b!te', 'b.i.t.e',
  'c**', 'c*ul', 'cul*', 'c.l', 'c*u*l',
  't*gueule', 'tg', 't@gueule', 'ta g*eule',
  's*laud', 's@laud',
  'fd*p', 'f-d-p', 'f.d.p', 'f d p',
  'nt*m', 'n.t.m', 'n-t-m',
  'br*nleur', 'br4nleur', 'b**nleur',
  'b*tard', 'bat*rd', 'b@tard',
  'tr*uduc', 'troud*k', 'trou.d.c',
  'c*nnasse', 'conn4sse', 'c0nnasse']; // Remplacez par les mots que vous souhaitez surveiller

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

      // Si le membre a le rôle exempté, ne rien faire
      if (member.roles.cache.has('1339286435475230800')) return;
      
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
