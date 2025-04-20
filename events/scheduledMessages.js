import { EmbedBuilder } from 'discord.js';
import cron from 'node-cron';

export default (client) => {
  // Planification pour chaque mercredi, samedi et dimanche à 7h du matin
  cron.schedule('48 15 * * 3,6,0', () => {
    const channel = client.channels.cache.get('1340250246038683689');
    if (!channel) {
      console.error('Canal pour les messages planifiés introuvable!');
      return;
    }
    
    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Équipe de développement de l'Ob Zelda",
        iconURL: "https://res.cloudinary.com/dor9octmp/image/upload/v1745146312/Capture_d_e%CC%81cran_2025-04-20_a%CC%80_12.51.30_nyrj6v.png",
      })
      .setTitle("Obtenez les prérequis pour un prestige via une simple commande !")
      .setDescription("Il vous suffit d'utiliser la commande `/prestige {type} {niveau}` dans le salon <#1340250246038683689> pour faire apparaître un embed contenant tout les prérequis du prestige sélectionné !\n\nSi vous remarquez une erreur ou avez les prérequis pour un prestige actuellement non disponible, n'hésitez pas à nous le faire savoir en ouvrant un ticket dans le salon <#1339335025161928724>.\n\nSi tout se passe bien vous devrez avoir quelque chose comme cela :")
      .setImage("https://res.cloudinary.com/dor9octmp/image/upload/v1745145872/Capture_d_e%CC%81cran_2025-04-20_a%CC%80_12.38.11_t4acpa.png")
      .setThumbnail("https://res.cloudinary.com/dor9octmp/image/upload/v1745145881/Icone_prestiges_ei04af.png")
      .setColor("#00b0f4");
    
    channel.send({ embeds: [embed] })
      .then(() => console.log('Message planifié envoyé avec succès!'))
      .catch(error => console.error('Erreur lors de l\'envoi du message planifié:', error));
  }, {
    timezone: "Europe/Paris" // Assurez-vous que l'heure correspond à votre fuseau horaire
  });
  
  console.log('Messages planifiés initialisés!');
};
