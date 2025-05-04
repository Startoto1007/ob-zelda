import { SlashCommandBuilder } from 'discord.js';
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus
} from '@discordjs/voice';

export const data = new SlashCommandBuilder()
  .setName('jouer-musique')
  .setDescription('Joue une musique dans le salon vocal de conférence')
  .addStringOption(option =>
    option.setName('musique')
      .setDescription('Choisissez la musique')
      .setRequired(true)
      .addChoices(
        { name: 'Ouverture du PW', value: 'pw' },
        { name: 'Ballad of the Goddess', value: 'goddess' }
      )
  );

export async function execute(interaction) {
  if (!interaction.member.permissions.has('Administrator')) {
    return interaction.reply({ content: '❌ Seuls les administrateurs peuvent utiliser cette commande.', ephemeral: true });
  }

  const choice = interaction.options.getString('musique');
  const voiceChannel = interaction.guild.channels.cache.get('1368627117683638333');

  if (!voiceChannel || voiceChannel.type !== 2) {
    return interaction.reply({ content: '❌ Le salon vocal de conférence est introuvable.', ephemeral: true });
  }

  const url = choice === 'pw'
    ? 'https://res.cloudinary.com/dor9octmp/video/upload/v1746274822/Ouverture_du_PW_kh5mlb.mp3'
    : 'https://res.cloudinary.com/dor9octmp/video/upload/v1746275077/1-04_Theme_of_Skyward_Sword_-_Ballad_of_the_Goddess_bpkyyr.mp3';

  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(url);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await interaction.reply({ content: `🎵 Lecture de **${choice === 'pw' ? 'Ouverture du PW' : 'Ballad of the Goddess'}** dans le salon vocal.` });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ Une erreur est survenue pendant la lecture.', ephemeral: true });
  }
}
