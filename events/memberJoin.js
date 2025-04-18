import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // ========== 1. Génération de l'image personnalisée ==========
      const canvas = createCanvas(1024, 450);
      const ctx = canvas.getContext('2d');

      // Arrière-plan
      const background = await loadImage('https://i.imgur.com/fzaneHB.jpeg');
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Avatar du membre
      const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
      const avatarSize = 256;
      const avatarX = canvas.width / 2 - avatarSize / 2;
      const avatarY = canvas.height / 2 - avatarSize / 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

      // Enregistrement en pièce jointe
      const buffer = canvas.toBuffer('image/png');
      const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });

      // ========== 2. Embed privé (DM) ==========
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

      // ========== 3. Embed public (canal) ==========
      const secondEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`${member.user.username} a rejoint le serveur !`)
        .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
        .setImage('attachment://welcome.png') // image générée
        .setTimestamp();

      const channel = member.guild.channels.cache.get('1348227800355569707');
      if (channel) {
        await channel.send({ embeds: [secondEmbed], files: [attachment] });
      } else {
        console.error("Canal introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des embeds :", error);
    }
  });
};
