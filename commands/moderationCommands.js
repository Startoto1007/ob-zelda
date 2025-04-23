import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('moderation')
  .setDescription('Commandes de modération pour le serveur')
  .addSubcommand(subcommand =>
    subcommand
      .setName('mute')
      .setDescription('Mute un membre pour une durée spécifique')
      .addUserOption(option => option.setName('joueur').setDescription('Le membre à mute').setRequired(true))
      .addStringOption(option => option.setName('durée').setDescription('La durée du mute (ex: 1h, 1d)').setRequired(true))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('unmute')
      .setDescription('Unmute un membre')
      .addUserOption(option => option.setName('joueur').setDescription('Le membre à unmute').setRequired(true))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('ban')
      .setDescription('Ban un membre pour une durée spécifique')
      .addUserOption(option => option.setName('joueur').setDescription('Le membre à ban').setRequired(true))
      .addStringOption(option => option.setName('durée').setDescription('La durée du ban (ex: 1h, 1d)').setRequired(true))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('unban')
      .setDescription('Unban un membre')
      .addUserOption(option => option.setName('joueur').setDescription('Le membre à unban').setRequired(true))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('kick')
      .setDescription('Kick un membre')
      .addUserOption(option => option.setName('joueur').setDescription('Le membre à kick').setRequired(true))
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('avertissement')
      .setDescription('Avertir un membre')
      .addUserOption(option => option.setName('joueur').setDescription('Le membre à avertir').setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const joueur = interaction.options.getUser('joueur');
  const durée = interaction.options.getString('durée');
  const raison = interaction.options.getString('raison') || 'Aucune raison spécifiée';

  switch (subcommand) {
    case 'mute':
      await handleMute(interaction, joueur, durée, raison);
      break;
    case 'unmute':
      await handleUnmute(interaction, joueur);
      break;
    case 'ban':
      await handleBan(interaction, joueur, durée, raison);
      break;
    case 'unban':
      await handleUnban(interaction, joueur);
      break;
    case 'kick':
      await handleKick(interaction, joueur, raison);
      break;
    case 'avertissement':
      await handleAvertissement(interaction, joueur, raison);
      break;
    default:
      await interaction.reply({ content: 'Commande inconnue', ephemeral: true });
  }
}

async function handleMute(interaction, joueur, durée, raison) {
  const member = interaction.guild.members.cache.get(joueur.id);
  if (!member) {
    return interaction.reply({ content: 'Membre introuvable.', ephemeral: true });
  }

  const durationMs = parseDuration(durée);
  if (isNaN(durationMs)) {
    return interaction.reply({ content: 'Durée invalide.', ephemeral: true });
  }

  try {
    await member.timeout(durationMs, raison);
    await interaction.reply({ content: `Membre ${joueur.tag} muté pour ${durée}.`, ephemeral: true });

    const modEmbed = createModEmbed(interaction.user, joueur, 'Mute', durée, raison);
    await interaction.guild.channels.cache.get('1349788945554079784').send({ embeds: [modEmbed] });

    const dmEmbed = createDMEmbed(joueur, durée, raison);
    await joueur.send({ embeds: [dmEmbed] }).catch(() => {});
  } catch (error) {
    console.error('Erreur lors du mute:', error);
    await interaction.reply({ content: 'Erreur lors du mute du membre.', ephemeral: true });
  }
}

async function handleUnmute(interaction, joueur) {
  const member = interaction.guild.members.cache.get(joueur.id);
  if (!member) {
    return interaction.reply({ content: 'Membre introuvable.', ephemeral: true });
  }

  try {
    await member.timeout(null);
    await interaction.reply({ content: `Membre ${joueur.tag} unmute.`, ephemeral: true });

    const modEmbed = createModEmbed(interaction.user, joueur, 'Unmute', 'N/A', 'Unmute par un modérateur');
    await interaction.guild.channels.cache.get('1349788945554079784').send({ embeds: [modEmbed] });
  } catch (error) {
    console.error('Erreur lors de l\'unmute:', error);
    await interaction.reply({ content: 'Erreur lors de l\'unmute du membre.', ephemeral: true });
  }
}

async function handleBan(interaction, joueur, durée, raison) {
  const member = interaction.guild.members.cache.get(joueur.id);
  if (!member) {
    return interaction.reply({ content: 'Membre introuvable.', ephemeral: true });
  }

  const durationMs = parseDuration(durée);
  if (isNaN(durationMs)) {
    return interaction.reply({ content: 'Durée invalide.', ephemeral: true });
  }

  try {
    await member.ban({ reason: raison, deleteMessageSeconds: durationMs / 1000 });
    await interaction.reply({ content: `Membre ${joueur.tag} banni pour ${durée}.`, ephemeral: true });

    const modEmbed = createModEmbed(interaction.user, joueur, 'Ban', durée, raison);
    await interaction.guild.channels.cache.get('1349788945554079784').send({ embeds: [modEmbed] });
  } catch (error) {
    console.error('Erreur lors du ban:', error);
    await interaction.reply({ content: 'Erreur lors du ban du membre.', ephemeral: true });
  }
}

async function handleUnban(interaction, joueur) {
  try {
    await interaction.guild.members.unban(joueur.id);
    await interaction.reply({ content: `Membre ${joueur.tag} unbanni.`, ephemeral: true });

    const modEmbed = createModEmbed(interaction.user, joueur, 'Unban', 'N/A', 'Unban par un modérateur');
    await interaction.guild.channels.cache.get('1349788945554079784').send({ embeds: [modEmbed] });
  } catch (error) {
    console.error('Erreur lors de l\'unban:', error);
    await interaction.reply({ content: 'Erreur lors de l\'unban du membre.', ephemeral: true });
  }
}

async function handleKick(interaction, joueur, raison) {
  const member = interaction.guild.members.cache.get(joueur.id);
  if (!member) {
    return interaction.reply({ content: 'Membre introuvable.', ephemeral: true });
  }

  try {
    await member.kick(raison);
    await interaction.reply({ content: `Membre ${joueur.tag} kické.`, ephemeral: true });

    const modEmbed = createModEmbed(interaction.user, joueur, 'Kick', 'N/A', raison);
    await interaction.guild.channels.cache.get('1349788945554079784').send({ embeds: [modEmbed] });
  } catch (error) {
    console.error('Erreur lors du kick:', error);
    await interaction.reply({ content: 'Erreur lors du kick du membre.', ephemeral: true });
  }
}

async function handleAvertissement(interaction, joueur, raison) {
  const member = interaction.guild.members.cache.get(joueur.id);
  if (!member) {
    return interaction.reply({ content: 'Membre introuvable.', ephemeral: true });
  }

  try {
    await interaction.reply({ content: `Membre ${joueur.tag} averti.`, ephemeral: true });

    const modEmbed = createModEmbed(interaction.user, joueur, 'Avertissement', 'N/A', raison);
    await interaction.guild.channels.cache.get('1349788945554079784').send({ embeds: [modEmbed] });

    const dmEmbed = createDMEmbed(joueur, 'N/A', raison);
    await joueur.send({ embeds: [dmEmbed] }).catch(() => {});
  } catch (error) {
    console.error('Erreur lors de l\'avertissement:', error);
    await interaction.reply({ content: 'Erreur lors de l\'avertissement du membre.', ephemeral: true });
  }
}

function parseDuration(duration) {
  const timeUnit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1));

  switch (timeUnit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return NaN;
  }
}

function createModEmbed(moderator, target, action, duration, reason) {
  return {
    color: 0x0099ff,
    title: `Action de modération: ${action}`,
    fields: [
      { name: 'Modérateur', value: moderator.tag, inline: true },
      { name: 'Membre', value: target.tag, inline: true },
      { name: 'Durée', value: duration || 'N/A', inline: true },
      { name: 'Raison', value: reason },
    ],
    timestamp: new Date().toISOString(),
  };
}

function createDMEmbed(target, duration, reason) {
  return {
    color: 0xff0000,
    title: 'Vous avez été sanctionné',
    description: `Raison: ${reason}\nDurée: ${duration || 'N/A'}`,
    timestamp: new Date().toISOString(),
  };
}
