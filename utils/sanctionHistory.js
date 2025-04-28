import { setTimeout } from 'timers/promises';
import fs from 'fs';
import path from 'path';

const SANCTIONS_FILE = path.join(__dirname, 'sanctions.json');

// Fonction pour ajouter une sanction à l'historique
export async function addSanctionToHistory(userId, type, duration, reason, moderator) {
  const sanctions = await getSanctionsFromHistory();
  sanctions.push({
    userId,
    type,
    duration,
    reason,
    moderator: moderator.tag,
    timestamp: new Date().toISOString(),
  });
  await fs.promises.writeFile(SANCTIONS_FILE, JSON.stringify(sanctions, null, 2));
}

// Fonction pour supprimer une sanction de l'historique
export async function removeSanctionFromHistory(userId, type) {
  let sanctions = await getSanctionsFromHistory();
  sanctions = sanctions.filter(sanction => !(sanction.userId === userId && sanction.type === type));
  await fs.promises.writeFile(SANCTIONS_FILE, JSON.stringify(sanctions, null, 2));
}

// Fonction pour obtenir les sanctions de l'historique
export async function getSanctionsFromHistory(userId) {
  const sanctions = await getSanctionsFromHistory();
  return userId ? sanctions.filter(sanction => sanction.userId === userId) : sanctions;
}

// Fonction pour vérifier les sanctions cumulées
export async function checkCumulativeSanctions(userId, interaction) {
  const sanctions = await getSanctionsFromHistory(userId);
  const avertissementCount = sanctions.filter(sanction => sanction.type === 'Avertissement').length;

  if (avertissementCount >= 3) {
    await handleMute(interaction.guild.members.cache.get(userId), '3 avertissements cumulés', 3600000); // 1 heure
  } else if (avertissementCount >= 5) {
    await handleMute(interaction.guild.members.cache.get(userId), '5 avertissements cumulés', 86400000); // 1 jour
  } else if (avertissementCount >= 10) {
    await handleMute(interaction.guild.members.cache.get(userId), '10 avertissements cumulés', 604800000); // 1 semaine
  } else if (avertissementCount >= 15) {
    await handleBan(interaction.guild.members.cache.get(userId), '15 avertissements cumulés', 1209600000); // 2 semaines
  } else if (avertissementCount >= 20) {
    await handleBan(interaction.guild.members.cache.get(userId), '20 avertissements cumulés', 2592000000); // 1 mois
  } else if (avertissementCount >= 25) {
    await handleBan(interaction.guild.members.cache.get(userId), '25 avertissements cumulés', 5184000000); // 2 mois
  } else if (avertissementCount >= 30) {
    await handleDefBan(interaction.guild.members.cache.get(userId), '30 avertissements cumulés');
  }

  // Réinitialiser les avertissements tous les mois
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  setTimeout(nextMonth.getTime() - now.getTime(), () => {
    removeSanctionFromHistory(userId, 'Avertissement');
  });
}

// Fonction pour appliquer un mute
async function handleMute(member, reason, duration) {
  const embed = new EmbedBuilder()
    .setTitle('Vous avez été mute')
    .setDescription(`Raison : ${reason}\nDurée : ${formatDuration(duration)}`)
    .setColor(0xff0000);

  await member.send({ embeds: [embed], ephemeral: true }).catch(() => {});
  await member.timeout(duration, reason);
}

// Fonction pour appliquer un ban temporaire
async function handleBan(member, reason, duration) {
  const embed = new EmbedBuilder()
    .setTitle('Vous avez été banni temporairement')
    .setDescription(`Raison : ${reason}\nDurée : ${formatDuration(duration)}`)
    .setColor(0xff0000);

  await member.send({ embeds: [embed], ephemeral: true }).catch(() => {});
  await member.ban({ reason: reason, deleteMessageSeconds: duration / 1000 });

  // Supprimer le ban après la durée spécifiée
  setTimeout(duration, () => {
    member.guild.members.unban(member.id);
  });
}

// Fonction pour appliquer un ban définitif
async function handleDefBan(member, reason) {
  const embed = new EmbedBuilder()
    .setTitle('Vous avez été banni définitivement')
    .setDescription(`Raison : ${reason}`)
    .setColor(0xff0000);

  await member.send({ embeds: [embed], ephemeral: true }).catch(() => {});
  await member.ban({ reason: reason });
}

// Fonction pour formater la durée
function formatDuration(durationMs) {
  const seconds = Math.floor(durationMs / 1000) % 60;
  const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
  const hours = Math.floor(durationMs / (1000 * 60 * 60)) % 24;
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days} jour(s)`);
  if (hours > 0) parts.push(`${hours} heure(s)`);
  if (minutes > 0) parts.push(`${minutes} minute(s)`);
  if (seconds > 0) parts.push(`${seconds} seconde(s)`);

  return parts.join(' ');
}

// Fonction pour obtenir les sanctions de l'historique
async function getSanctionsFromHistory() {
  try {
    const data = await fs.promises.readFile(SANCTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}
