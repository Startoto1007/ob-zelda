import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('prestige')
  .setDescription('Affiche les prérequis pour un prestige')
  .addStringOption(option =>
    option.setName('type')
      .setDescription('Le type de prestige')
      .setRequired(true)
      .addChoices(
        { name: 'Bronze', value: 'bronze' },
        { name: 'Argent', value: 'argent' },
        { name: 'Or', value: 'or' },
        { name: 'Crystal', value: 'crystal' },
        { name: 'Rubis', value: 'rubis' }
      ))
  .addIntegerOption(option =>
    option.setName('niveau')
      .setDescription('Le niveau du prestige')
      .setRequired(true)
      .addChoices(
        { name: '1', value: 1 },
        { name: '2', value: 2 },
        { name: '3', value: 3 }
      ));

export async function execute(interaction) {
  const type = interaction.options.getString('type');
  const niveau = interaction.options.getInteger('niveau');

  let embed;

  if (type === 'bronze' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32') // couleur bronze
      .setTitle('Prestige Bronze 1')
      .setDescription('• Argent : 250k\n• Vote : 1x\n• One-Block : 100 blocs minés\n• Grimoires communs : 1\n• Playtime : 15 min');
  } else if (type === 'bronze' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Bronze 2')
      .setDescription('• Argent : 500k\n• Vote : 5x\n• One-Block : 250 blocs minés\n• Grimoires communs : 5\n• Playtime : 30 min');
  } else if (type === 'bronze' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Bronze 3')
      .setDescription('• Argent : 1M\n• Vote : 10x\n• One-Block : 500 blocs minés\n• Grimoires communs : 25\n• Playtime : 60 min\n• Items jetés dans la fontaine : 1\n• Mine : 250 blocs minés\n• Points joueurs : 2,5k\n• Daily : 3x\n• Agriculteur : niv4');
  } else if (type === 'argent' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Argent 1')
      .setDescription('• Argent : 2,5M\n• Vote : 10x\n• One-Block : 1k blocs minés\n• Grimoires communs : 50\n• Playtime : 2h\n• Items jetés dans la fontaine : 2\n• Mine : 500 blocs minés\n• Points joueurs : 5k\n• Daily : 5x\n• Agriculteur : niv6');
  } else if (type === 'argent' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Argent 2')
      .setDescription('• Argent : 5M\n• Vote : 15x\n• One-Block : 1,5k blocs minés\n• Grimoires commun : 75\n• Grimoires rare : 5\n• Playtime : 4h\n• Items jetés dans la fontaine : 5\n• Mine : 1k blocs minés\n• Points joueurs : 7,5k\n• Daily : 10x\n• Agriculteur : niv9\n• Mineur : niv2');
  } else if (type === 'argent' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Argent 3')
      .setDescription('• Argent : 10M\n• Vote : 20x\n• One-Block : 2,5k blocs minés\n• Grimoires commun : 100\n• Grimoires rare : 10\n• Playtime : 6h\n• Items jetés dans la fontaine : 10\n• Block minés dans la mine : 2,5k\n• Points joueurs : 7,5k\n• Daily : 15x\n• Agriculteur : niv11\n• Mineur : niv4\nur : niv2');
  } else if (type === 'or' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Argent 3')
      .setDescription('Voici les prérequis pour le prestige Bronze 2...');
  } else {
    embed = new EmbedBuilder()
      .setColor('#808080') // couleur grise par défaut pour les autres cas
      .setTitle('Prestige inconnu')
      .setDescription(`Tu as choisi le prestige ${type} ${niveau}, mais je n’ai pas encore les infos pour celui-là.`);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
