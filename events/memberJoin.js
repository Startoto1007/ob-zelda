import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';

export default (client) => {
  // Événement lorsque quelqu'un rejoint le serveur
  client.on('guildMemberAdd', async (member) => {
    try {
      // 🎨 Configuration du canvas
      const width = 1280;
      const height = 640;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // 🔲 Image d'arrière-plan
      const background = await loadImage('https://res.cloudinary.com/dor9octmp/image/upload/v1745054283/Capture_d_e%CC%81cran_2025-04-19_a%CC%80_11.12.48_pclp9y.png');
      ctx.drawImage(background, 0, 0, width, height);

      // 👤 Avatar avec bordure ronde
      const avatarSize = 150; // Taille de l'avatar
      const avatarX = 50; // Position de l'avatar sur l'axe X
      const avatarY = height / 2 - avatarSize / 2; // Position sur l'axe Y (centré)

      const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // 🖼️ Génération de l'image finale
      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'welcome-image.png' });

      // 📬 Embed en DM
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage("https://res.cloudinary.com/dor9octmp/image/upload/v1745054283/Capture_d_e%CC%81cran_2025-04-19_a%CC%80_11.12.48_pclp9y.png")
        .setTimestamp();

      // Envoie l'embed en DM
      try {
        await member.send({ embeds: [welcomeEmbed] });
      } catch (error) {
        console.error("Impossible d'envoyer un DM à l'utilisateur :", error);
      }

      // 📢 Message simple avec l'image modifiée et le ping de l'utilisateur
      const channel = member.guild.channels.cache.get('1348227800355569707'); // ID du canal
      if (channel) {
        await channel.send({
          content: `${member.user}, bienvenue dans notre serveur !`,
          files: [attachment]
        });
      } else {
        console.error("Canal introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'image de bienvenue :", error);
    }
  });
};
