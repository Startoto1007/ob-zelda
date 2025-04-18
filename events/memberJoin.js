import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import sharp from 'sharp'; // Import de sharp pour manipuler les images

export default (client) => {
  // Événement lorsque quelqu'un rejoint le serveur
  client.on('guildMemberAdd', async (member) => {
    try {
      // Chargement des images
      const backgroundImage = 'https://i.imgur.com/JnSa4Eh.jpeg'; // Image d'arrière-plan
      const avatarURL = member.user.displayAvatarURL(); // Avatar du membre

      // Créer l'image d'arrière-plan floutée avec sharp
      const background = await sharp(backgroundImage)
        .resize(800, 600) // Adapter l'arrière-plan à la taille souhaitée
        .blur(2) // Appliquer un léger flou
        .png() // Convertir en PNG
        .toBuffer(); // Convertir en buffer pour pouvoir l'utiliser

      // Redimensionner l'avatar du membre
      const avatar = await sharp(avatarURL)
        .resize(200, 200) // Taille de l'avatar
        .toBuffer(); // Convertir en buffer

      // Créer l'image finale en superposant l'avatar sur l'arrière-plan
      const finalImage = await sharp(background)
        .composite([{
          input: avatar,
          top: 150, // Position verticale de l'avatar sur l'image
          left: 100, // Position horizontale
          raw: { width: 200, height: 200 }, // Dimensions de l'avatar
        }])
        .png() // Exporter en PNG
        .toBuffer(); // Convertir en buffer

      // Création de l'embed de bienvenue
      const welcomeEmbed = new EmbedBuilder()
        .setColor("#f500c0")
        .setTitle(`Bienvenue sur notre serveur d'ob ${member.user.username}!`)
        .setDescription("Ici tu trouveras :\n • des concours\n • un super bot qui te donne les prérequis pour les prestiges\n • un salon de commerce\n • toutes les actualités de l'ob")
        .setImage('attachment://welcome-image.png') // Lien de l'image générée attachée à l'embed
        .setTimestamp();

      // Attacher l'image générée à l'embed
      const attachment = new AttachmentBuilder(finalImage, { name: 'welcome-image.png' });

      // Envoie de l'embed avec l'image dans le DM du membre
      await member.send({ embeds: [welcomeEmbed], files: [attachment] });

    } catch (error) {
      console.error("Erreur lors de l'envoi du message de bienvenue:", error);
    }

    // Création de l'embed d'annonce dans un canal public
    const secondEmbed = new EmbedBuilder()
      .setColor("#f500c0")
      .setTitle(`${member.user.username} a rejoint le serveur !`)
      .setDescription(`Que tout le monde dise bonjour à ${member.user.toString()} !`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    // Envoie l'embed dans le canal de bienvenue
    const channel = member.guild.channels.cache.get('1348227800355569707'); // ID du canal
    if (channel) {
      await channel.send({ embeds: [secondEmbed] });
    } else {
      console.error("Canal introuvable !");
    }
  });
};
