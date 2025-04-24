import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('concours')
  .setDescription('Lancer un concours')
  .addStringOption(option => option.setName('prix').setDescription('Le prix du concours').setRequired(true))
  .addIntegerOption(option => option.setName('gagnants').setDescription('Nombre de gagnants').setRequired(true))
  .addIntegerOption(option => option.setName('durée').setDescription('Durée du concours en minutes').setRequired(true))
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

  // Créer l'embed pour le concours
  const embed = new EmbedBuilder()
    .setTitle('🎉 Nouveau Concours !')
    .setDescription(`Gagnez **${prix}** en participant au concours !\nNombre de gagnants : **${gagnants}**\nDurée : **${durée} minutes**`)
    .setColor(0x0099ff)
    .setTimestamp();

  // Créer le bouton pour participer
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('participer')
        .setLabel('Participer')
        .setStyle(ButtonStyle.Primary)
    );

  // Envoyer le message du concours
  const channel = interaction.guild.channels.cache.get('1339304412509769729'); // ID du salon pour les tests
  if (!channel) {
    return interaction.reply({ content: 'Salon introuvable.', ephemeral: true });
  }

  const message = await channel.send({ embeds: [embed], components: [row] });

  // Ajouter un collecteur pour le bouton
  const collector = message.createMessageComponentCollector({ time: durée * 60000 });

  collector.on('collect', async i => {
    if (i.customId === 'participer') {
      await i.reply({ content: 'Vous avez participé au concours !', ephemeral: true });
    }
  });

  collector.on('end', async collected => {
    const winners = collected.users.filter(user => !collected.users.some(other => other.id === user.id));
    const selectedWinners = winners.sort(() => 0.5 - Math.random()).slice(0, gagnants);

    const winnersEmbed = new EmbedBuilder()
      .setTitle('🎉 Résultats du Concours !')
      .setDescription(`Félicitations aux gagnants :\n${selectedWinners.map(winner => `- ${winner.tag}`).join('\n')}`)
      .setColor(0x0099ff)
      .setTimestamp();

    await channel.send({ embeds: [winnersEmbed] });
  });

  await interaction.reply({ content: 'Le concours a été lancé avec succès !', ephemeral: true });
}
