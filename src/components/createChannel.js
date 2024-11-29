const { ChannelType, PermissionFlagsBits } = require('discord.js')

// Returns the channel property
const createChannel = async (interaction) => {
  return await interaction.guild.channels.create({
    name: `onboarding-${interaction.user.id}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id, // Deny everyone by default
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id, // Grant viewing but deny sending messages, threads, and reactions
        allow: [PermissionFlagsBits.ViewChannel],
        deny: [
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.CreatePrivateThreads,
          PermissionFlagsBits.AddReactions,
        ],
      },
      {
        id: interaction.client.user.id, // Bot permissions
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.CreatePrivateThreads,
          PermissionFlagsBits.AddReactions,
          PermissionFlagsBits.ManageChannels,
        ],
      },
    ],
  })
}

module.exports = createChannel
