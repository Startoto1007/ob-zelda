import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('concours')
  .setDescription('Lancer un concours')
  .addStringOption(option => option.setName('prix').setDescription('Le prix du concours').setRequired(true))
  .addIntegerOption(option => option.setName('gagnants').setDescription('Nombre de gagnants').setRequired(true))
  .addIntegerOption(option => option.setName('durée').setDescription('Durée du concours en minutes').setRequired(true))
  .addRoleOption(option => option.setName('rôle_requis').setDescription('Rôle requis pour participer (facultatif)').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  // Vérifier si l'utilisateur a le rôle "membre de l'OB"
  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member.roles.cache.has('1339286435475230800')) {
    return interaction.reply({ content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.', ephemeral: true });
  }

  const prix = interaction.options.getString('prix');
  const gagnants = interaction.options.getInteger('gagnants');
  const durée = interaction.options.getInteger('durée');
  const rôleRequis = interaction.options.getRole('rôle_requis');

  // Variable pour stocker les participants
  const participants = new Set();

  // Créer l'embed pour le concours
  const createEmbed = (participantsCount = 0) => {
    let description = `Gagnez **${prix}** en participant au concours !\nNombre de gagnants : **${gagnants}**\nDurée : **${durée} minutes**\nParticipants : **${participantsCount}**`;
    
    if (rôleRequis) {
      description += `\nRôle requis : **${rôleRequis.name}**`;
    }
    
    return new EmbedBuilder()
      .setTitle('🎉 Nouveau Concours !')
      .setDescription(description)
      .setColor(0x0099ff)
      .setTimestamp();
  };

  // Créer le bouton pour participer
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('participer')
        .setLabel('Participer')
        .setStyle(ButtonStyle.Primary)
    );

  // Envoyer le message du concours
  const channel = interaction.guild.channels.cache.get('1339304412509769729'); // ID du salon pour les concours
  if (!channel) {
    return interaction.reply({ content: 'Salon introuvable.', ephemeral: true });
  }

  const embed = createEmbed(0);
  const message = await channel.send({ embeds: [embed], components: [row] });

  // Ajouter un collecteur pour le bouton
  const collector = message.createMessageComponentCollector({ time: durée * 60000 });

  collector.on('collect', async i => {
    if (i.customId === 'participer') {
      // Vérifier si l'utilisateur a déjà participé
      if (participants.has(i.user.id)) {
        await i.reply({ content: 'Vous participez déjà à ce concours !', ephemeral: true });
        return;
      }

      // Vérifier si l'utilisateur a le rôle requis (s'il y en a un)
      if (rôleRequis) {
        const memberInteraction = i.guild.members.cache.get(i.user.id);
        if (!memberInteraction.roles.cache.has(rôleRequis.id)) {
          await i.reply({ 
            content: `Vous avez besoin du rôle ${rôleRequis.name} pour participer à ce concours !`, 
            ephemeral: true 
          });
          return;
        }
      }

      // Ajouter l'utilisateur aux participants
      participants.add(i.user.id);
      
      // Mettre à jour l'embed avec le nouveau nombre de participants
      const updatedEmbed = createEmbed(participants.size);
      await message.edit({ embeds: [updatedEmbed], components: [row] });
      
      await i.reply({ content: 'Vous avez participé au concours !', ephemeral: true });
    }
  });

  collector.on('end', async () => {
    // Désactiver le bouton
    const disabledRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('participer')
          .setLabel('Concours terminé')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    
    await message.edit({ components: [disabledRow] });

    // Sélectionner les gagnants
    if (participants.size === 0) {
      const noWinnersEmbed = new EmbedBuilder()
        .setTitle('🎉 Résultats du Concours !')
        .setDescription(`Aucun participant n'a rejoint le concours.`)
        .setColor(0xFF0000)
        .setTimestamp();
      
      await channel.send({ embeds: [noWinnersEmbed] });
      return;
    }

    // Convertir le Set en Array pour pouvoir sélectionner aléatoirement
    const participantsArray = Array.from(participants);
    
    // Déterminer le nombre de gagnants (ne peut pas dépasser le nombre de participants)
    const winnerCount = Math.min(gagnants, participantsArray.length);
    
    // Sélectionner les gagnants aléatoirement
    const selectedWinners = [];
    const winnerIds = new Set();
    
    while (selectedWinners.length < winnerCount) {
      const randomIndex = Math.floor(Math.random() * participantsArray.length);
      const winnerId = participantsArray[randomIndex];
      
      if (!winnerIds.has(winnerId)) {
        winnerIds.add(winnerId);
        selectedWinners.push(winnerId);
      }
    }

    // Récupérer les utilisateurs gagnants
    const winnersList = await Promise.all(
      selectedWinners.map(async (winnerId) => {
        try {
          const user = await interaction.client.users.fetch(winnerId);
          return `<@${user.id}> (${user.tag})`;
        } catch (error) {
          console.error(`Erreur lors de la récupération de l'utilisateur ${winnerId}:`, error);
          return `<@${winnerId}>`;
        }
      })
    );

    // Créer l'embed des résultats
    const winnersEmbed = new EmbedBuilder()
      .setTitle('🎉 Résultats du Concours !')
      .setDescription(`Félicitations aux ${winnerCount} gagnant(s) du concours **${prix}** !\n\n${winnersList.join('\n')}`)
      .setColor(0x00FF00)
      .setFooter({ text: `Total des participants: ${participants.size}` })
      .setTimestamp();

    await channel.send({ embeds: [winnersEmbed] });
  });

  await interaction.reply({ content: 'Le concours a été lancé avec succès !', ephemeral: true });
}
