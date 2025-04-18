import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import Canvas from '@napi-rs/canvas';
import fetch from 'node-fetch';

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // Récupère l'avatar de l'utilisateur
      const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 512 });
      const avatarResponse = await fetch(avatarURL);
      const avatarBuffer = await avatarResponse.arrayBuffer();

      // Charge l’arrière-plan
      const backgroundResponse = await fetch('https://i.imgur.com/JnSa4Eh.jpeg');
      const backgroundBuffer = await backgroundResponse.arrayBuffer();

      // Création du canvas
      const canvas = Canvas.createCanvas(800, 300);
      const ctx = canvas.getContext('2d');

      // Ajoute l’arrière-plan flouté
      const background = await Canvas.loadImage(Buffer.from(backgroundBuffer));
      ctx.filter = 'blur(2px)';
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      // Dessine l’avatar avec un cercle et une bordure
      const avatar = await Canvas.loadImage(Buffer.from(avatarBuffer));
      const avatarX = 40;
      const avatarY = 40;
      const avatarRadius = 100;

      // Bordure
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius + 5, 0, Math.PI * 2, true);
      ctx.fillStyle = '#f500c0';
      ctx.fill();

      // Avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarRadius * 2, avatarRadius * 2);
      ctx.restore();

      // Texte
      ctx.fillStyle = '#ffffff';
      ctx.font = '32px "Serif"'; // à remplacer si tu veux une vraie police Zelda personnalisée
      ctx.fillText('Bienvenue dans', 280, 120);
      ctx.fillText('le royaume d\'Hyrule', 280, 170);

      // Prépare l’image finale
      const buffer = await canvas.encode('png');
      const attachment = new AttachmentBuilder(buffer, { name: 'bienvenue.png' });

      // Embed à envoyer dans le salon
      const embed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`${member.user.username} a rejoint le serveur !`)
        .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
        .setImage('attachment://bienvenue.png')
        .setTimestamp();

      // Envoie le message dans le salon
      const channel = member.guild.channels.cache.get('1348227800355569707');
      if (channel) {
        await channel.send({ embeds: [embed], files: [attachment] });
      } else {
        console.error("Canal introuvable !");
      }

      // DM de bienvenue
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage("https://i.imgur.com/4ug9AH9.jpeg")
        .setTimestamp();

      try {
        await member.send({ embeds: [welcomeEmbed] });
      } catch (error) {
        console.error("Impossible d'envoyer un DM à l'utilisateur :", error);
      }

    } catch (error) {
      console.error("Erreur lors de l'envoi des embeds :", error);
    }
  });
};
