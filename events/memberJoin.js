import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // 🎨 Configuration du canvas
      const width = 1280;
      const height = 640;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // 🔲 Image d'arrière-plan + flou très léger
      const background = await loadImage('https://res.cloudinary.com/dor9octmp/image/upload/v1744971567/Capture_d_e%CC%81cran_2025-04-18_a%CC%80_11.27.22_fncjkw.png');
      ctx.drawImage(background, 0, 0, width, height);

      // Simuler un flou très léger en superposant plusieurs couches transparentes
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 4; i++) {
        ctx.drawImage(canvas, 0, 0, width, height);
      }
      ctx.globalAlpha = 1;

      // 👤 Avatar avec bordure ronde
      const avatarSize = 250;
      const avatarX = width / 2 - avatarSize / 2;
      const avatarY = 160;

      // Cercle de bordure
      ctx.beginPath();
      ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.closePath();

      // Avatar
      const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // ✍️ Texte
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px Sans';
      ctx.textAlign = 'center';
      ctx.fillText(`Bienvenue ${member.user.username} !`, width / 2, 500);

      // 🖼️ Génération de l'image finale
      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'welcome-image.png' });

      // 📬 Embed en DM
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage('https://res.cloudinary.com/dor9octmp/image/upload/v1744972638/Capture_d_e%CC%81cran_2025-04-05_a%CC%80_10.24.06_yv2agt.png')
        .setTimestamp();

      try {
        await member.send({ embeds: [welcomeEmbed] });
      } catch (error) {
        console.error("Impossible d'envoyer un DM à l'utilisateur :", error);
      }

      // 📢 Embed public avec image personnalisée
      const publicEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`${member.user.username} a rejoint le serveur !`)
        .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
        .setImage('attachment://welcome-image.png')
        .setTimestamp();

      const channel = member.guild.channels.cache.get('1348227800355569707');
      if (channel) {
        await channel.send({ embeds: [publicEmbed], files: [attachment] });
      } else {
        console.error("Canal introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de l’envoi de l’image de bienvenue :", error);
    }
  });
};
