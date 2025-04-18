import { EmbedBuilder } from 'discord.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';

export default (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      // Récupère l'avatar du membre
      const avatarUrl = member.user.displayAvatarURL({ format: 'png', size: 256 });

      // Chargement de l'image d'arrière-plan
      const background = await loadImage('https://i.imgur.com/JnSa4Eh.jpeg');
      const avatar = await loadImage(avatarUrl);

      // Créer le canvas
      const canvas = createCanvas(700, 250);
      const ctx = canvas.getContext('2d');

      // Dessiner l'arrière-plan (flouté)
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Légèrement flouter l'arrière-plan
      ctx.filter = 'blur(2px)';
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none'; // Supprime l'effet de flou après usage

      // Dessiner l'avatar du membre à gauche (avec bordure)
      const avatarSize = 100;
      ctx.beginPath();
      ctx.arc(avatarSize + 20, 125, avatarSize / 2, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 20, 75, avatarSize, avatarSize);

      // Ajouter le texte "Bienvenue au royaume d'Hyrule" à droite de l'avatar
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif'; // Utilise une police de remplacement ici
      ctx.fillText('Bienvenue au royaume d\'Hyrule', 140, 150); // Position du texte

      // Convertir l'image en buffer pour l'envoyer dans l'embed
      const imageBuffer = canvas.toBuffer();

      // Création de l'embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage('attachment://welcome-image.png') // Lien de l'image générée
        .setTimestamp();

      // Envoi du message à l'utilisateur
      const welcomeMessage = await member.send({ embeds: [welcomeEmbed], files: [{ attachment: imageBuffer, name: 'welcome-image.png' }] });

      // Envoi de l'embed dans un autre canal
      const secondEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`${member.user.username} a rejoint le serveur !`)
        .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
        .setTimestamp();

      const channel = member.guild.channels.cache.get('1348227800355569707'); // Remplacer par l'ID du canal
      if (channel) {
        await channel.send({ embeds: [secondEmbed] });
      } else {
        console.error("Canal introuvable !");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des embeds ou de la génération de l'image :", error);
    }
  });
};
