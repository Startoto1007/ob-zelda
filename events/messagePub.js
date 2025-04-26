import { EmbedBuilder } from 'discord.js';

export const handleMessageCreate = async (message) => {
  if (message.channel.id === '1365354306798354536' && !message.author.bot) {
    const member = message.guild.members.cache.get(message.author.id);
    const hasVerifiedRole = member.roles.cache.has('1339323401503903785');
    const today = new Date().toISOString().split('T')[0];
    const lastMessage = member.lastMessageSent || {};

    if (!hasVerifiedRole) {
      await message.delete();
      const errorEmbed = new EmbedBuilder()
        .setTitle('Erreur')
        .setDescription('Vous n\'avez pas le rôle "Compte vérifié" requis pour poster dans ce salon. Veuillez ouvrir un ticket dans le salon <#1339335025161928724> pour l\'obtenir.')
        .setColor(0xff0000);
      await message.author.send({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
      return;
    }

    if (lastMessage.channelId === message.channel.id && lastMessage.date === today) {
      await message.delete();
      const errorEmbed = new EmbedBuilder()
        .setTitle('Erreur')
        .setDescription('Vous avez déjà posté un message de pub aujourd\'hui. Veuillez attendre demain pour reposter votre pub.')
        .setColor(0xff0000);
      await message.author.send({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
      return;
    }

    member.lastMessageSent = {
      channelId: message.channel.id,
      date: today,
    };
  }
};
