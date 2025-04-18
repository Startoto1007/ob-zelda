import { EmbedBuilder } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import fetch from 'node-fetch';

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // Téléchargement de l'image d'arrière-plan
      const backgroundImageUrl = 'https://res.cloudinary.com/dor9octmp/image/upload/v1744971567/Capture_d_e%CC%81cran_2025-04-18_a%CC%80_11.27.22_fncjkw.png';
      const response = await fetch(backgroundImageUrl);
      const buffer = await response.buffer();
      const backgroundFilePath = './background-image.png';
      fs.writeFileSync(backgroundFilePath, buffer);

      // Création de l'avatar du membre
      const avatarUrl = member.user.displayAvatarURL({ format: 'png', size: 128 });
      const avatarResponse = await fetch(avatarUrl);
      const avatarBuffer = await avatarResponse.buffer();
      const avatarFilePath = './avatar.png';
      fs.writeFileSync(avatarFilePath, avatarBuffer);

      // Chargement des images
      const backgroundImage = await loadImage(backgroundFilePath);
      const avatarImage = await loadImage(avatarFilePath);

      // Création du canvas
      const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
      const ctx = canvas.getContext('2d');
      
      // Ajouter l'image d'arrière-plan (floutée légèrement si besoin)
      ctx.drawImage(backgroundImage, 0, 0);

      // Ajouter l'avatar du membre à gauche
      const avatarSize = 128; // Taille de l'avatar
      ctx.beginPath();
      ctx.arc(avatarSize / 2, backgroundImage.height / 2, avatarSize / 2, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImage, 0, backgroundImage.height / 2 - avatarSize / 2, avatarSize, avatarSize);
      
      // Ajouter le texte "Bienvenue dans le royaume d'Hyrule" à droite de l'avatar
      ctx.font = '36px Arial';
      ctx.fillStyle = '#ffffff'; // Couleur du texte
      ctx.fillText('Bienvenue dans le royaume d\'Hyrule', avatarSize + 20, backgroundImage.height / 2 + 10);

      // Sauvegarder l'image générée
      const outputImagePath = './output-image.png';
      const outputBuffer = canvas.toBuffer();
      fs.writeFileSync(outputImagePath, outputBuffer);

      // Création de l'embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur d'OB ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'OB")
        .setImage('attachment://output-image.png')
        .setTimestamp();

      // Envoie l'embed avec l'image dans le canal de bienvenue
      const channel = member.guild.channels.cache.get('1348227800355569707'); // ID du canal
      if (channel) {
        await channel.send({ embeds: [welcomeEmbed], files: [{ attachment: outputImagePath, name: 'output-image.png' }] });
      } else {
        console.error("Canal introuvable !");
      }

      // Envoie un message privé avec l'embed
      try {
        await member.send({ embeds: [welcomeEmbed], files: [{ attachment: outputImagePath, name: 'output-image.png' }] });
      } catch (error) {
        console.error("Impossible d'envoyer un DM à l'utilisateur :", error);
      }

      // Supprime les fichiers temporaires
      fs.unlinkSync(backgroundFilePath);
      fs.unlinkSync(avatarFilePath);
      fs.unlinkSync(outputImagePath);

    } catch (error) {
      console.error("Erreur lors de la création ou de l'envoi de l'embed :", error);
    }
  });
};
