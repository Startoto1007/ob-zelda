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
      .setTitle('Prestige Bronze I')
      .setDescription('• Argent : 250k\n• Vote : 1x\n• One-Block : 100 blocs minés\n• Grimoires communs : 1\n• Playtime : 15 min');
  } else if (type === 'bronze' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Bronze II')
      .setDescription('• Argent : 500k\n• Vote : 5x\n• One-Block : 250 blocs minés\n• Grimoires communs : 5\n• Playtime : 30 min');
  } else if (type === 'bronze' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Bronze III')
      .setDescription('• Argent : 1M\n• Vote : 10x\n• One-Block : 500 blocs minés\n• Grimoires communs : 25\n• Playtime : 60 min\n• Items jetés dans la fontaine : 1\n• Mine : 250 blocs minés\n• Points joueurs : 2,5k\n• Daily : 3x\n• Agriculteur : niv4');
  } else if (type === 'argent' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#b3b3b3')
      .setTitle('Prestige Argent I')
      .setDescription('• Argent : 2,5M\n• Vote : 10x\n• One-Block : 1k blocs minés\n• Grimoires communs : 50\n• Playtime : 2h\n• Items jetés dans la fontaine : 2\n• Mine : 500 blocs minés\n• Points joueurs : 5k\n• Daily : 5x\n• Agriculteur : niv6');
  } else if (type === 'argent' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#b3b3b3')
      .setTitle('Prestige Argent II')
      .setDescription('• Argent : 5M\n• Vote : 15x\n• One-Block : 1,5k blocs minés\n• Grimoires commun : 75\n• Grimoires rare : 5\n• Playtime : 4h\n• Items jetés dans la fontaine : 5\n• Mine : 1k blocs minés\n• Points joueurs : 7,5k\n• Daily : 10x\n• Agriculteur : niv9\n• Mineur : niv2');
  } else if (type === 'argent' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#b3b3b3')
      .setTitle('Prestige Argent III')
      .setDescription('• Argent : 10M\n• Vote : 20x\n• One-Block : 2,5k blocs minés\n• Grimoires commun : 100\n• Grimoires rare : 10\n• Playtime : 6h\n• Items jetés dans la fontaine : 10\n• Mine : 2,5k blocs minés\n• Points joueurs : 7,5k\n• Daily : 15x\n• Agriculteur : niv11\n• Mineur : niv4');
  } else if (type === 'or' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#c99028')
      .setTitle('Prestige Or I')
      .setDescription('• Argent : 15M\n• Vote : 25x\n• One-Block : 3,5k blocs minés\n• Grimoires commun : 150\n• Grimoires rare : 20\n• Playtime : 10h\n• Items jetés dans la fontaine : 20\n• Mine : 5k blocs minés\n• Points joueurs : 10k\n• Daily : 20x\n• Agriculteur : niv13\n• Mineur : niv6');
  } else if (type === 'or' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#c99028')
      .setTitle('Prestige Or II')
      .setDescription('• Argent : 20M\n• Vote : 35x\n• One-Block : 4,5k blocs minés\n• Grimoires commun : 250\n• Grimoires rare : 35\n• Grimoires épique : 3\n• Playtime : 16h\n• Items jetés dans la fontaine : 30\n• Mine : 8k blocs minés\n• Points joueurs : 25k\n• Daily : 25x\n• Agriculteur : niv16\n• Mineur : niv9\n• Bûcheron : niv2');
  } else if (type === 'or' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#c99028')
      .setTitle('Prestige Or III')
      .setDescription('• Argent : 30M\n• Vote : 50x\n• One-Block : 7k blocs minés\n• Grimoires commun : 400\n• Grimoires rare : 50\n• Grimoires épique : 10\n• Playtime : 24h\n• Items jetés dans la fontaine : 40\n• Mine : 12,5k blocs minés\n• Points joueurs : 35k\n• Daily : 35x\n• Agriculteur : niv19\n• Mineur : niv11\n• Bûcheron : niv4');
  } else if (type === 'crystal' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#9941bc')
      .setTitle('Prestige Crystal I')
      .setDescription('...');
  } else {
    embed = new EmbedBuilder()
      .setColor('#808080') // couleur grise par défaut pour les autres cas
      .setTitle('Prestige inconnu')
      .setDescription(`Tu as choisi le prestige ${type} ${niveau}, mais je n’ai pas encore les infos pour celui-là. (ou alors j'ai eu la flemme de l'ajouter ^^)`);
  }

  await interaction.reply({ embeds: [embed] });
}
