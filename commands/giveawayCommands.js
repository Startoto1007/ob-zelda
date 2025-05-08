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

// Fonction pour lire les giveaways depuis le fichier JSON
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

// Fonction pour écrire les giveaways dans le fichier JSON
function writeGiveaways(giveaways) {
  try {
    fs.writeFileSync(giveawaysFilePath, JSON.stringify(giveaways, null, 2));
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le fichier giveaways.json:', error);
  }
}

// Fonction pour analyser la date fournie par l'utilisateur
function parseDate(dateStr) {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
  const match = dateStr.match(regex);

  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  const hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);

  if (month < 0 || month > 11 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return new Date(year, month, day, hour, minute);
}

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Gestion des concours')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addSubcommand(subcommand =>
    subcommand
      .setName('lancer')
      .setDescription('Lancer un concours')
      .addStringOption(option => 
        option.setName('prix').setDescription('Le prix du concours').setRequired(true)
      )
      .addIntegerOption(option => 
        option.setName('gagnants').setDescription('Nombre de gagnants').setRequired(true)
      )
      .addStringOption(option => 
        option.setName('date_fin').setDescription('Date et heure de fin du concours (format: JJ/MM/AAAA HH:MM)').setRequired(true)
      )
      .addRoleOption(option => 
        option.setName('rôle_requis').setDescription('Rôle requis pour participer').setRequired(false)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('participants')
      .setDescription('Voir les participants d\'un concours')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('relancer')
      .setDescription('Relancer un concours pour désigner un autre gagnant')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('terminer')
      .setDescription('Terminer un concours plus tôt')
  );

export async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const giveaways = readGiveaways();

  if (subcommand === 'lancer') {
    const prix = interaction.options.getString('prix');
    const gagnants = interaction.options.getInteger('gagnants');
    const dateFinStr = interaction.options.getString('date_fin');
    const rôleRequis = interaction.options.getRole('rôle_requis');

    const dateFin = parseDate(dateFinStr);
    if (!dateFin) {
      return interaction.reply({ content: 'Format de date invalide. Utilisez le format JJ/MM/AAAA HH:MM', ephemeral: true });
    }

    const now = new Date();
    if (dateFin <= now) {
      return interaction.reply({ content: 'La date de fin doit être dans le futur.', ephemeral: true });
    }

    const duréeMs = dateFin.getTime() - now.getTime();
    const participants = new Set();

    const createEmbed = (participantsCount = 0) => {
      const tempsRestantMs = dateFin - now;
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
      return interaction.reply({ content: 'Salon introuvable.', ephemeral: true });
    }

    const embed = createEmbed(0);
    const message = await channel.send({ embeds: [embed], components: [row] });

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
            await i.reply({ content: `Vous avez besoin du rôle ${rôleRequis.name} pour participer à ce concours !`, ephemeral: true });
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

      const participantsArray = Array.from(participants);
      const winnerCount = Math.min(gagnants, participantsArray.length);
      const selectedWinners = [];

      while (selectedWinners.length < winnerCount) {
        const randomIndex = Math.floor(Math.random() * participantsArray.length);
        selectedWinners.push(participantsArray[randomIndex]);
      }

      const winnerEmbed = new EmbedBuilder()
        .setTitle('🎉 Résultats du Concours !')
        .setDescription(`Félicitations à ${selectedWinners.join(', ')} pour avoir gagné **${prix}** !`)
        .setColor(0x00FF00)
        .setTimestamp();

      await channel.send({ embeds: [winnerEmbed] });
    });
  }

  else if (subcommand === 'participants') {
    // Voir les participants d'un concours
    const concours = giveaways.find(g => g.guildId === interaction.guild.id);
    if (!concours) {
      return interaction.reply({ content: 'Aucun concours actif trouvé.', ephemeral: true });
    }

    const participantsList = concours.participants.length ? concours.participants.join('\n') : 'Aucun participant.';
    const embed = new EmbedBuilder()
      .setTitle('Participants du Concours')
      .setDescription(participantsList)
      .setColor(0x0099ff);

    return interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === 'relancer') {
    // Relancer un concours pour désigner un autre gagnant
    const concours = giveaways.find(g => g.guildId === interaction.guild.id);
    if (!concours) {
      return interaction.reply({ content: 'Aucun concours actif trouvé.', ephemeral: true });
    }

    const winner = concours.participants[Math.floor(Math.random() * concours.participants.length)];
    return interaction.reply({ content: `Le gagnant relancé est : ${winner}`, ephemeral: true });
  }

  else if (subcommand === 'terminer') {
    // Terminer un concours plus tôt
    const concours = giveaways.find(g => g.guildId === interaction.guild.id);
    if (!concours) {
      return interaction.reply({ content: 'Aucun concours actif trouvé.', ephemeral: true });
    }

    giveaways.splice(giveaways.indexOf(concours), 1);
    writeGiveaways(giveaways);

    return interaction.reply({ content: 'Le concours a été terminé plus tôt.', ephemeral: true });
  }
}
