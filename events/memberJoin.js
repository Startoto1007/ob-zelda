import { EmbedBuilder, AttachmentBuilder } from 'discord.js';

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // Création de l'embed de bienvenue pour le membre (en DM)
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage("https://res.cloudinary.com/dor9octmp/image/upload/v1744972638/Capture_d_e%CC%81cran_2025-04-05_a%CC%80_10.24.06_yv2agt.png")
        .setTimestamp();

      // Envoie le message directement à l'utilisateur (en DM)
      try {
        await member.send({ embeds: [welcomeEmbed] });
      } catch (error) {
        console.error("Impossible d'envoyer un DM à l'utilisateur :", error);
      }

      // Envoie un message simple avec l'image jointe dans le canal public
      const channel = member.guild.channels.cache.get('1348227800355569707');  // ID du canal
      if (channel) {
        const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 512 });
        const welcomeImage = new AttachmentBuilder('https://res.cloudinary.com/dor9octmp/image/upload/v1745054283/Capture_d_e%CC%81cran_2025-04-19_a%CC%80_11.12.48_pclp9y.png')
          .setName('welcome-image.png');

        // Envoie du message dans le canal avec l'avatar à gauche
        channel.send({
          content: `${member.user.toString()} a rejoint le serveur !`,
          files: [welcomeImage]
        });
      } else {
        console.error("Canal introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des embeds :", error);
    }
  });
};
