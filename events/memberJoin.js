import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      const width = 1280;
      const height = 640;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Chargement de l'image de fond
      const background = await loadImage("https://res.cloudinary.com/dor9octmp/image/upload/v1745054283/Capture_d_e%CC%81cran_2025-04-19_a%CC%80_11.12.48_pclp9y.png");
      ctx.drawImage(background, 0, 0, width, height);

      // Dimensions de l'avatar
      const avatarSize = Math.floor(height * 2 / 5); // 2/5 de la hauteur de l’image
      const avatarX = (width / 3) / 2 - avatarSize / 2; // centré dans le premier tiers horizontal
      const avatarY = height / 2 - avatarSize / 2;

      // Chargement et affichage de l'avatar
      const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'welcome-image.png' });

      // Embed en DM
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur, ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage("https://i.imgur.com/4ug9AH9.jpeg")
        .setTimestamp();

      try {
        await member.send({ embeds: [welcomeEmbed] });
      } catch (error) {
        console.error("Impossible d'envoyer un DM à l'utilisateur :", error);
      }

      const channel = member.guild.channels.cache.get("1348227800355569707");
      if (channel) {
        await channel.send({
          content: `Bienvenue ${member.user.toString()} !`,
          files: [attachment]
        });
      } else {
        console.error("Canal introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de l’envoi de l’image de bienvenue :", error);
    }
  });
};
