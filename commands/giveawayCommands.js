import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import fs from 'fs';
import path from 'path';

const giveawaysFilePath = path.resolve('./giveaways.json');

function readGiveaways() {
  try {
    if (!fs.existsSync(giveawaysFilePath)) {
      fs.writeFileSync(giveawaysFilePath, JSON.stringify([]));
    }
    const data = fs.readFileSync(giveawaysFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier giveaways.json:', error);
    return [];
  }
}

function writeGiveaways(giveaways) {
  try {
    fs.writeFileSync(giveawaysFilePath, JSON.stringify(giveaways, null, 2));
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le fichier giveaways.json:', error);
  }
}

function parseDate(dateStr) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
  const match = dateStr.match(regex);

  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);

  if (
    month < 0 || month > 11 ||
    day < 1 || day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59
  ) {
    return null;
  }

  return new Date(year, month, day, hour, minute);
}

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Lancer un concours')
  .addStringOption(option =>
    option.setName('prix')
      .setDescription('Le prix du concours')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('gagnants')
      .setDescription('Nombre de gagnants')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('date_fin')
      .setDescription('Date et heure de fin du concours (format: JJ/MM/AAAA HH:MM)')
      .setRequired(true))
  .addRoleOption(option =>
    option.setName('rôle_requis')
      .setDescription('Rôle requis pour participer (facultatif)')
      .setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member.roles.cache.has('1339286435475230800')) {
    return interaction.reply({
      content: 'Vous n\'avez pas les permissions nécessaires pour utiliser cette commande.',
      ephemeral: true
    });
  }

  const prix = interaction.options.getString('prix');
  const gagnants = interaction.options.getInteger('gagnants');
  const dateFinStr = interaction.options.getString('date_fin');
  const rôleRequis = interaction.options.getRole('rôle_requis');
  const dateFin = parseDate(dateFinStr);

  if (!dateFin) {
    return interaction.reply({
      content: 'Format de date invalide. Utilisez le format JJ/MM/AAAA HH:MM',
      ephemeral: true
    });
  }

  const now = new Date();
  if (dateFin <= now) {
    return interaction.reply({
      content: 'La date de fin doit être dans le futur.',
      ephemeral: true
    });
  }

  const duréeMs = dateFin.getTime() - now.getTime();
  const participants = new Set();

  const createEmbed = (participantsCount = 0) => {
    const maintenant = new Date();
    const tempsRestantMs = dateFin - maintenant;
    const tempsRestantMin = Math.floor(tempsRestantMs / 60000);
    const heures = Math.floor(tempsRestantMin / 60);
    const minutes = tempsRestantMin % 60;
    const tempsRestantStr = `${heures}h ${minutes}min`;

    const dateFinFormatted = `${dateFin.toLocaleDateString('fr-FR')} à ${dateFin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

    let description = `🎁 Gagnez **${prix}** en participant au concours !\n👥 Nombre de gagnants : **${gagnants}**\n⏰ Se termine le : **${dateFinFormatted}** (*dans ${tempsRestantStr}*)\n👤 Lancé par : <@${interaction.user.id}>\n👤 Participants : **${participantsCount}**`;

    if (rôleRequis) {
      description += `\n🎫 Rôle requis : **${rôleRequis.name}**`;
    }

    return new EmbedBuilder()
      .setTitle('🎉 Nouveau Concours !')
      .setDescription(description)
      .setColor(0x0099ff)
      .setFooter({ text: `Fin prévue le ${dateFinFormatted}` })
      .setTimestamp();
  };

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('participer')
        .setLabel('Participer')
        .setStyle(ButtonStyle.Primary)
    );

  const channel = interaction.guild.channels.cache.get('1339304412509769729');
  if (!channel) {
    return interaction.reply({
      content: 'Salon introuvable.',
      ephemeral: true
    });
  }

  const embed = createEmbed(0);
  const message = await channel.send({ embeds: [embed], components: [row] });

  const giveaways = readGiveaways();
  giveaways.push({
    messageId: message.id,
    channelId: channel.id,
    guildId: interaction.guild.id,
    prix,
    gagnants,
    dateFin: dateFin.toISOString(),
    rôleRequis: rôleRequis ? rôleRequis.id : null,
    hôte: interaction.user.id,
    participants: []
  });
  writeGiveaways(giveaways);

  const collector = message.createMessageComponentCollector({ time: duréeMs });

  collector.on('collect', async i => {
    if (i.customId === 'participer') {
      if (participants.has(i.user.id)) {
        await i.reply({ content: 'Vous participez déjà à ce concours !', ephemeral: true });
        return;
      }

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

      participants.add(i.user.id);
      const updatedEmbed = createEmbed(participants.size);
      await message.edit({ embeds: [updatedEmbed], components: [row] });
      await i.reply({ content: 'Vous avez participé au concours !', ephemeral: true });
    }
  });

  collector.on('end', async () => {
    const disabledRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('participer')
          .setLabel('Concours terminé')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

    await message.edit({ components: [disabledRow] });

    if (participants.size === 0) {
      const noWinnersEmbed = new EmbedBuilder()
        .setTitle('🎉 Résultats du Concours !')
        .setDescription(`Aucun participant n'a rejoint le concours.`)
        .setColor(0xFF0000)
        .setTimestamp();

      await channel.send({ embeds: [noWinnersEmbed] });
      return;
    }

    const participantsArray = Array.from(participants);
    const winnerCount = Math.min(gagnants, participantsArray.length);
    const selectedWinners = [];
    const winnerIds = new Set();

    while (selectedWinners.length < winnerCount) {
      const randomIndex = Math.floor(Math.random() * participantsArray.length);
      const winnerId = participantsArray[randomIndex];

      if (!winnerIds.has(winnerId)) {
        winnerIds.add(winnerId);
        selectedWinners.push(`<@${winnerId}>`);
      }
    }

    const winnersEmbed = new EmbedBuilder()
      .setTitle('🎉 Résultats du Concours !')
      .setDescription(`Félicitations à nos ${selectedWinners.length} gagnant(s) pour **${prix}** :\n\n${selectedWinners.join('\n')}`)
      .setColor(0x00FF00)
      .setTimestamp();

    await channel.send({ embeds: [winnersEmbed] });
  });

  await interaction.reply({
    content: 'Concours lancé avec succès !',
    ephemeral: true
  });
}
