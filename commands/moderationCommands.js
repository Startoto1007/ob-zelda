import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setTimeout } from 'timers/promises';

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
  .addSubcommand(subcommand =>
    subcommand
      .setName('def_ban')
      .setDescription('Ban définitivement un membre')
      .addUserOption(option => option.setName('joueur').setDescription('Le membre à bannir définitivement').setRequired(true))
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

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
    case 'def_ban':
      await handleDefBan(interaction, joueur, raison);
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

    // Ajouter à l'historique des sanctions
    await addSanctionToHistory(joueur.id, 'Mute', durée, raison, interaction.user);

    // Vérifier les sanctions cumulées
    await checkCumulativeSanctions(joueur.id, interaction);
  } catch (error) {
    console.error('Erreur lors du mute :', error);
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

    // Supprimer de l'historique des sanctions
    await removeSanctionFromHistory(joueur.id, 'Mute');
  } catch (error) {
    console.error('Erreur lors de l\'unmute :', error);
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

    // Ajouter à l'historique des sanctions
    await addSanctionToHistory(joueur.id, 'Ban', durée, raison, interaction.user);

    // Vérifier les sanctions cumulées
    await checkCumulativeSanctions(joueur.id, interaction);
  } catch (error) {
    console.error('Erreur lors du ban :', error);
    await interaction.reply({ content: 'Erreur lors du ban du membre.', ephemeral: true });
  }
}

async function handleUnban(interaction, joueur) {
  try {
    await interaction.guild.members.unban(joueur.id);
    await interaction.reply({ content: `Membre ${joueur.tag} unbanni.`, ephemeral: true });

    const modEmbed = createModEmbed(interaction.user, joueur, 'Unban', 'N/A', 'Unban par un modérateur');
    await interaction.guild.channels.cache.get('1349788945554079784').send({ embeds: [modEmbed] });

    // Supprimer de l'historique des sanctions
    await removeSanctionFromHistory(joueur.id, 'Ban');
  } catch (error) {
    console.error('Erreur lors de l\'unban :', error);
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

    // Ajouter à l'historique des sanctions
    await addSanctionToHistory(joueur.id, 'Kick', 'N/A', raison, interaction.user);

    // Vérifier les sanctions cumulées
    await checkCumulativeSanctions(joueur.id, interaction);
  } catch (error) {
    console.error('Erreur lors du kick :', error);
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

    // Ajouter à l'historique des sanctions
    await addSanctionToHistory(joueur.id, 'Avertissement', 'N/A', raison, interaction.user);

    // Vérifier les sanctions cumulées
    await checkCumulativeSanctions(joueur.id, interaction);
  } catch (error) {
    console.error('Erreur lors de l\'avertissement :', error);
    await interaction.reply({ content: 'Erreur lors de l\'avertissement du membre.', ephemeral: true });
  }
}

async function handleDefBan(interaction, joueur, raison) {
  const member = interaction.guild.members.cache.get(joueur.id);
  if (!member) {
    return interaction.reply({ content: 'Membre introuvable.', ephemeral: true });
  }

  try {
    await member.ban({ reason: raison });
    await interaction.reply({ content: `Membre ${joueur.tag} banni définitivement.`, ephemeral: true });

    const modEmbed = createModEmbed(interaction.user, joueur, 'Ban définitif', 'N/A', raison);
    await interaction.guild.channels.cache.get('1349788945554079784').send({ embeds: [modEmbed] });

    // Ajouter à l'historique des sanctions
    await addSanctionToHistory(joueur.id, 'Ban définitif', 'N/A', raison, interaction.user);
  } catch (error) {
    console.error('Erreur lors du ban définitif :', error);
    await interaction.reply({ content: 'Erreur lors du ban définitif du membre.', ephemeral: true });
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

async function addSanctionToHistory(userId, type, duration, reason, moderator) {
  // Votre logique pour ajouter une sanction à l'historique
  // Par exemple, vous pouvez utiliser une base de données ou un fichier JSON
}

async function removeSanctionFromHistory(userId, type) {
  // Votre logique pour supprimer une sanction de l'historique
  // Par exemple, vous pouvez utiliser une base de données ou un fichier JSON
}

async function checkCumulativeSanctions(userId, interaction) {
  // Votre logique pour vérifier les sanctions cumulées
  // Par exemple, vous pouvez utiliser une base de données ou un fichier JSON
  const sanctions = await getSanctionsFromHistory(userId);
  const avertissementCount = sanctions.filter(sanction => sanction.type === 'Avertissement').length;

  if (avertissementCount >= 3) {
    await handleMute(interaction, interaction.guild.members.cache.get(userId), '3h', '3 avertissements cumulés');
  } else if (avertissementCount >= 5) {
    await handleMute(interaction, interaction.guild.members.cache.get(userId), '1d', '5 avertissements cumulés');
  } else if (avertissementCount >= 10) {
    await handleMute(interaction, interaction.guild.members.cache.get(userId), '1w', '10 avertissements cumulés');
  } else if (avertissementCount >= 20) {
    await handleBan(interaction, interaction.guild.members.cache.get(userId), '1m', '20 avertissements cumulés');
  } else if (avertissementCount >= 30) {
    await handleBan(interaction, interaction.guild.members.cache.get(userId), '1m', '30 avertissements cumulés');
  } else if (avertissementCount >= 50) {
    await handleDefBan(interaction, interaction.guild.members.cache.get(userId), '50 avertissements cumulés');
  }
}

async function getSanctionsFromHistory(userId) {
  // Votre logique pour obtenir les sanctions de l'historique
  // Par exemple, vous pouvez utiliser une base de données ou un fichier JSON
  return [];
}
