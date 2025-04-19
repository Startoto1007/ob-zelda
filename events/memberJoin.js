import { EmbedBuilder } from 'discord.js';

export default (client) => {
  // Événement lorsque quelqu'un rejoint le serveur
  client.on('guildMemberAdd', async (member) => {
    try {
      // Création de l'embed de bienvenue pour le membre
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage("https://i.imgur.com/4ug9AH9.jpeg")
        .setTimestamp();

      // Envoie le message directement à l'utilisateur (en DM)
      try {
        await member.send({ embeds: [welcomeEmbed] });
      } catch (error) {
        console.error("Impossible d'envoyer un DM à l'utilisateur :", error);
      }

      // Création de l'embed pour annoncer le membre dans un canal public
      const secondEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`${member.user.username} a rejoint le serveur !`)
        .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

      // Envoie l'embed dans le canal spécifique
      const channel = member.guild.channels.cache.get('1348227800355569707'); // ID du canal
      if (channel) {
        await channel.send({ embeds: [secondEmbed] });
      } else {
        console.error("Canal introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des embeds :", error);
    }
  });
};
