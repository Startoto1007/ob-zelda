import { EmbedBuilder } from 'discord.js';

export default (client) => {
  // Événement lorsque quelqu'un rejoint le serveur
  client.on('guildMemberAdd', async (member) => {
    // Création de l'embed de bienvenue pour le membre
    const welcomeEmbed = new EmbedBuilder()
      .setColor("#f500c0")
      .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username} !`)
      .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
      .setImage("https://i.imgur.com/4ug9AH9.jpeg")
      .setTimestamp();

    // Envoie le message dans un canal principal
    const mainChannel = member.guild.channels.cache.get('ID_DU_CANAL_PRINCIPAL'); // Remplace par l'ID du canal principal
    if (mainChannel) {
      mainChannel.send({ embeds: [welcomeEmbed] });
    }

    // Création de l'embed pour un autre canal
    const secondEmbed = new EmbedBuilder()
      .setColor("#f500c0")
      .setTitle(`${member.user.username} a rejoint le serveur !`)
      .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    // Envoie le message dans un autre canal
    const secondChannel = member.guild.channels.cache.get('ID_DU_DEUXIEME_CANAL'); // Remplace par l'ID du deuxième canal
    if (secondChannel) {
      secondChannel.send({ embeds: [secondEmbed] });
    }
  });
};
