import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // 🎨 Création de l'image personnalisée
      const canvas = createCanvas(1024, 500);
      const ctx = canvas.getContext('2d');

      // Arrière-plan
      const background = await loadImage('https://i.imgur.com/JnSa4Eh.jpeg');
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Avatar du membre
      const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
      ctx.save();
      ctx.beginPath();
      ctx.arc(512, 240, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 412, 140, 200, 200);
      ctx.restore();

      // Texte de bienvenue
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Sans';
      ctx.textAlign = 'center';
      ctx.fillText(`Bienvenue ${member.user.username} !`, canvas.width / 2, 400);

      // Création du fichier image
      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'welcome-image.png' });

      // 📨 Embed envoyé en DM au membre
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

      // 📢 Embed public avec l’image générée
      const secondEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`${member.user.username} a rejoint le serveur !`)
        .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
        .setImage('attachment://welcome-image.png')
        .setTimestamp();

      const channel = member.guild.channels.cache.get('1348227800355569707');
      if (channel) {
        await channel.send({ embeds: [secondEmbed], files: [attachment] });
      } else {
        console.error("Canal introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des messages de bienvenue :", error);
    }
  });
};
