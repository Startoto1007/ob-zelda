import { EmbedBuilder } from 'discord.js';

export default (client) => {
  // Événement lorsque quelqu'un rejoint le serveur
  client.on('guildMemberAdd', async (member) => {
    // Création de l'embed de bienvenue pour le membre
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('Bienvenue sur le serveur !')
      .setDescription('Nous sommes heureux de t’accueillir sur notre serveur ! N’oublie pas de consulter les règles et de t’amuser !')
      .setThumbnail(member.user.displayAvatarURL())
      .addFields({
        name: 'Règles',
        value: 'N’oublie pas de lire les règles et de respecter les autres membres.',
      })
      .setTimestamp();

    // Envoie le message dans un canal principal
    const mainChannel = member.guild.channels.cache.get('ID_DU_CANAL_PRINCIPAL'); // Remplace par l'ID du canal principal
    if (mainChannel) {
      mainChannel.send({ embeds: [welcomeEmbed] });
    }

    // Création de l'embed pour un autre canal
    const secondEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Un nouveau membre a rejoint !')
      .setDescription(`Bienvenue à ${member.user.username} ! 🎉`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    // Envoie le message dans un autre canal
    const secondChannel = member.guild.channels.cache.get('ID_DU_DEUXIEME_CANAL'); // Remplace par l'ID du deuxième canal
    if (secondChannel) {
      secondChannel.send({ embeds: [secondEmbed] });
    }
  });
};
