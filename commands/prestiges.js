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
        { name: 'Argent', value: 'argent' }
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
      .setDescription('Voici les prérequis pour le prestige Bronze 1...');
  } else if (type === 'bronze' && niveau === 2) {
    embed = new EmbedBuilder()
      .setColor('#cd7f32')
      .setTitle('Prestige Bronze 2')
      .setDescription('Voici les prérequis pour le prestige Bronze 2...');
  } else {
    embed = new EmbedBuilder()
      .setColor('#808080') // couleur grise par défaut pour les autres cas
      .setTitle('Prestige inconnu')
      .setDescription(`Tu as choisi le prestige ${type} ${niveau}, mais je n’ai pas encore les infos pour celui-là.`);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
