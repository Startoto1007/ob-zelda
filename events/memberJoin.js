import { EmbedBuilder } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';  // Utilisation de canvas

export default (client) => {
  // Événement lorsque quelqu'un rejoint le serveur
  client.on('guildMemberAdd', async (member) => {
    try {
      // Préparation de l'image
      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext('2d');
      const background = await loadImage('https://i.imgur.com/JnSa4Eh.jpeg');
      const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png' }));

      // Dessiner l'arrière-plan légèrement flouté
      ctx.filter = 'blur(5px)';
      ctx.drawImage(background, 0, 0, 800, 400);
      ctx.filter = 'none';

      // Dessiner l'avatar du membre à gauche
      ctx.beginPath();
      ctx.arc(100, 200, 75, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 25, 125, 150, 150);

      // Ajouter le texte à droite
      ctx.font = '40px "Zelda"';  // Assure-toi d'avoir la bonne police
      ctx.fillStyle = '#f500c0';
      ctx.fillText('Bienvenue dans le royaume d\'Hyrule', 200, 200);

      // Convertir l'image en buffer
      const imageBuffer = canvas.toBuffer();

      // Création de l'embed de bienvenue
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#f500c0')
        .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username} !`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage('attachment://welcome-image.png')
        .setTimestamp();

      // Envoie le message directement à l'utilisateur (en DM)
      try {
        await member.send({ embeds: [welcomeEmbed], files: [{ attachment: imageBuffer, name: 'welcome-image.png' }] });
      } catch (error) {
        console.error('Impossible d\'envoyer un DM à l\'utilisateur :', error);
      }

      // Création de l'embed pour annoncer le membre dans un canal public
      const secondEmbed = new EmbedBuilder()
        .setColor('#f500c0')
        .setTitle(`${member.user.username} a rejoint le serveur !`)
        .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

      // Envoie l'embed dans le canal spécifique
      const channel = member.guild.channels.cache.get('1348227800355569707');  // ID du canal
      if (channel) {
        await channel.send({ embeds: [secondEmbed], files: [{ attachment: imageBuffer, name: 'welcome-image.png' }] });
      } else {
        console.error('Canal introuvable !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des embeds :', error);
    }
  });
};
