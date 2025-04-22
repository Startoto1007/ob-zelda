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
        { name: 'Rubis', value: 'rubis' },
        { name: 'Platine', value: 'platine' }
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
      .setDescription('• Argent : 250k\n• Vote : 1x\n• One-Block : 100 blocs minés\n• Grimoires communs : 1\n• Playtime : 15 min')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/c_thumb,w_200,g_face/v1745137095/Bronze_1_ncqoer.png');
  } else if (type === 'bronze' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Bronze II')
      .setDescription('• Argent : 500k\n• Vote : 5x\n• One-Block : 250 blocs minés\n• Grimoires communs : 5\n• Playtime : 30 min')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137095/Bronze_2_fnqtmz.png');
  } else if (type === 'bronze' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Bronze III')
      .setDescription('• Argent : 1M\n• Vote : 10x\n• One-Block : 500 blocs minés\n• Grimoires communs : 25\n• Playtime : 60 min\n• Items jetés dans la fontaine : 1\n• Mine : 250 blocs minés\n• Points joueurs : 2,5k\n• Daily : 3x\n• Agriculteur : niv4')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137096/Bronze_3_w4ioap.png');
  } else if (type === 'argent' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#b3b3b3')
      .setTitle('Prestige Argent I')
      .setDescription('• Argent : 2,5M\n• Vote : 10x\n• One-Block : 1k blocs minés\n• Grimoires communs : 50\n• Playtime : 2h\n• Items jetés dans la fontaine : 2\n• Mine : 500 blocs minés\n• Points joueurs : 5k\n• Daily : 5x\n• Agriculteur : niv6')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137112/Argent_1_fyrpgw.png');
  } else if (type === 'argent' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#b3b3b3')
      .setTitle('Prestige Argent II')
      .setDescription('• Argent : 5M\n• Vote : 15x\n• One-Block : 1,5k blocs minés\n• Grimoires commun : 75\n• Grimoires rare : 5\n• Playtime : 4h\n• Items jetés dans la fontaine : 5\n• Mine : 1k blocs minés\n• Points joueurs : 7,5k\n• Daily : 10x\n• Agriculteur : niv9\n• Mineur : niv2')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137112/Argent_2_pnencx.png');
  } else if (type === 'argent' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#b3b3b3')
      .setTitle('Prestige Argent III')
      .setDescription('• Argent : 10M\n• Vote : 20x\n• One-Block : 2,5k blocs minés\n• Grimoires commun : 100\n• Grimoires rare : 10\n• Playtime : 6h\n• Items jetés dans la fontaine : 10\n• Mine : 2,5k blocs minés\n• Points joueurs : 7,5k\n• Daily : 15x\n• Agriculteur : niv11\n• Mineur : niv4')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137112/Argent_3_cicasv.png');
  } else if (type === 'or' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#c99028')
      .setTitle('Prestige Or I')
      .setDescription('• Argent : 15M\n• Vote : 25x\n• One-Block : 3,5k blocs minés\n• Grimoires commun : 150\n• Grimoires rare : 20\n• Playtime : 10h\n• Items jetés dans la fontaine : 20\n• Mine : 5k blocs minés\n• Points joueurs : 10k\n• Daily : 20x\n• Agriculteur : niv13\n• Mineur : niv6')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137123/Or_1_jlnmwv.png');
  } else if (type === 'or' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#c99028')
      .setTitle('Prestige Or II')
      .setDescription('• Argent : 20M\n• Vote : 35x\n• One-Block : 4,5k blocs minés\n• Grimoires commun : 250\n• Grimoires rare : 35\n• Grimoires épique : 3\n• Playtime : 16h\n• Items jetés dans la fontaine : 30\n• Mine : 8k blocs minés\n• Points joueurs : 25k\n• Daily : 25x\n• Agriculteur : niv16\n• Mineur : niv9\n• Bûcheron : niv2')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137123/Or_2_uya6ya.png');
  } else if (type === 'or' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#c99028')
      .setTitle('Prestige Or III')
      .setDescription('• Argent : 30M\n• Vote : 50x\n• One-Block : 7k blocs minés\n• Grimoires commun : 400\n• Grimoires rare : 50\n• Grimoires épique : 10\n• Playtime : 24h\n• Items jetés dans la fontaine : 40\n• Mine : 12,5k blocs minés\n• Points joueurs : 35k\n• Daily : 35x\n• Agriculteur : niv19\n• Mineur : niv11\n• Bûcheron : niv4')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137123/Or_3_qzlhls.png');
  } else if (type === 'crystal' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#9941bc')
      .setTitle('Prestige Crystal I')
      .setDescription('• Argent : 50M\n• Vote : 65x\n• One-Block : 9k blocs minés\n• Grimoires commun : 500\n• Grimoires rare : 75\n• Grimoires épique : 20\n• Grimoires ultime : 5\n• Playtime : 48h\n• Items jetés dans la fontaine : 50\n• Mine : 12,5k blocs minés\n• Points joueurs : 50k\n• Daily : 50x\n• Agriculteur : niv21\n• Mineur : niv12\n• Bûcheron : niv6')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137131/Crystal_1_fbvamr.png');
  } else if (type === 'crystal' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#9941bc')
      .setTitle('Prestige Crystal II')
      .setDescription('• Argent : 75M\n• Vote : 80x\n• One-Block : 12,5k blocs minés\n• Grimoires commun : 650\n• Grimoires rare : 100\n• Grimoires épique : 35\n• Grimoires ultime : 10\n• Playtime : 3j\n• Items jetés dans la fontaine : 70\n• Mine : 18k blocs minés\n• Points joueurs : 75k\n• Daily : 85x\n• Agriculteur : niv23\n• Mineur : niv14\n• Bûcheron : niv9\n• Pêcheur : niv2')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137131/Crystal_2_ygyz2g.png');
  } else if (type === 'crystal' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#9941bc')
      .setTitle('Prestige Crystal III')
      .setDescription('• Argent : 100M\n• Vote : 100x\n• One-Block : 15k blocs minés\n• Grimoires commun : 800\n• Grimoires rare : 135\n• Grimoires épique : 50\n• Grimoires ultime : 15\n• Playtime : 4j\n• Items jetés dans la fontaine : 100\n• Mine : 21,5k blocs minés\n• Points joueurs : 100k\n• Daily : 75x\n• Agriculteur : niv25\n• Mineur : niv17\n• Bûcheron : niv11\n• Pêcheur : niv4')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137131/Crystal_3_ibscmh.png');
  } else if (type === 'rubis' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#a82f24')
      .setTitle('Prestige Rubis I')
      .setDescription('• Argent : 125M\n• Vote : 125x\n• One-Block : 20k blocs minés\n• Grimoires commun : 1000\n• Grimoires rare : 150\n• Grimoires épique : 65\n• Grimoires ultime : 25\n• Playtime : 5j\n• Items jetés dans la fontaine : 140\n• Mine : 21,5k blocs minés\n• Points joueurs : 130k\n• Daily : 100x\n• Agriculteur : niv27\n• Mineur : niv21\n• Bûcheron : niv13\n• Pêcheur : niv6')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137138/Rubis_1_rk2poe.png');
  } else if (type === 'rubis' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#a82f24')
      .setTitle('Prestige Rubis II')
      .setDescription('• Argent : 150M\n• Vote : 150x\n• One-Block : 25k blocs minés\n• Grimoires commun : 1250\n• Grimoires rare : 175\n• Grimoires épique : 80\n• Grimoires ultime : 30\n• Playtime : 6j\n• Items jetés dans la fontaine : 180\n• Mine : 30k blocs minés\n• Points joueurs : 160k\n• Daily : 150x\n• Agriculteur : niv30\n• Mineur : niv24\n• Bûcheron : niv15\n• Pêcheur : niv9\n• Chasseur : niv2')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137138/Rubis_2_nins8m.png');
  } else if (type === 'rubis' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#a82f24')
      .setTitle('Prestige Rubis III')
      .setDescription('• Argent : 150M\n• Vote : 150x\n• One-Block : 30k blocs minés\n• Grimoires commun : 1500\n• Grimoires rare : 200\n• Grimoires épique : 100\n• Grimoires ultime : 40\n• Playtime : 7j\n• Items jetés dans la fontaine : 220\n• Mine : 35k blocs minés\n• Points joueurs : 200k\n• Daily : 140x\n• Agriculteur : niv33\n• Mineur : niv27\n• Bûcheron : niv18\n• Pêcheur : niv11\n• Chasseur : niv4')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137140/Rubis_3_ay39of.png');
  } else if (type === 'platine' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#502681')
      .setTitle('Prestige Platine I')
      .setDescription('• Argent : 250M\n• Vote : 250x\n• One-Block : 40k blocs minés\n• Grimoires commun : 1800\n• Grimoires rare : 250\n• Grimoires épique : 125\n• Grimoires ultime : 50\n• Playtime : 9j\n• Items jetés dans la fontaine : 270\n• Mine : 35k blocs minés\n• Points joueurs : 250k\n• Daily : 165x\n• Agriculteur : niv36\n• Mineur : niv30\n• Bûcheron : niv21\n• Pêcheur : niv13\n• Chasseur : niv6')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137146/Platine_1_t0fkhk.png');
  } else if (type === 'platine' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#502681')
      .setTitle('Prestige Platine II')
      .setDescription('• Argent : 325M\n• Vote : 300x\n• One-Block : 40k blocs minés\n• Grimoires commun : 2000\n• Grimoires rare : 325\n• Grimoires épique : 150\n• Grimoires ultime : 60\n• Playtime : 11j\n• Items jetés dans la fontaine : 270\n• Mine : 35k blocs minés\n• Points joueurs : 250k\n• Daily : 165x\n• Agriculteur : niv36\n• Mineur : niv30\n• Bûcheron : niv21\n• Pêcheur : niv13\n• Chasseur : niv6')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137146/Platine_2_anqk6h.png');
  } else if (type === 'platine' && niveau === 3) {
    embed = new EmbedBuilder()
      .setColor('#502681')
      .setTitle('Prestige Platine III')
      .setDescription('• Argent : 400M\n• Vote : 350x\n• One-Block : 50k blocs minés\n• Grimoires commun : 2500\n• Grimoires rare : 400\n• Grimoires épique : 200\n• Grimoires ultime : 75\n• Playtime : 14j\n• Items jetés dans la fontaine : 370\n• Mine : 50k blocs minés\n• Points joueurs : 400k\n• Daily : 230x\n• Agriculteur : niv44\n• Mineur : niv36\n• Bûcheron : niv28\n• Pêcheur : niv19\n• Chasseur : niv11')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137146/Platine_3_ihz8jf.png');
  } else if (type === 'diamant' && niveau === 1) {
    embed = new EmbedBuilder()
      .setColor('#48bef4')
      .setTitle('Prestige Diamant I')
      .setDescription('...')
      .setThumbnail('https://res.cloudinary.com/dor9octmp/image/upload/v1745137154/Diamant_1_lnvhem.webp');
  } else {
    embed = new EmbedBuilder()
      .setColor('#808080') // couleur grise par défaut pour les autres cas
      .setTitle('Prestige inconnu')
      .setDescription(`Tu as choisi le prestige ${type} ${niveau}, mais je n’ai pas encore les infos pour celui-là. (ou alors j'ai eu la flemme de l'ajouter ^^)`);
  }

  await interaction.reply({ embeds: [embed] });
}
