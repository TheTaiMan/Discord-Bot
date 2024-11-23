// In your events/interactionCreate.js
const { ChannelType, PermissionFlagsBits } = require('discord.js')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return

    try {
      const channel = await interaction.guild.channels.create({
        name: `onboarding-${interaction.user.id}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.SendMessages],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
        ],
      })

      // Make sure to wait for the channel to be fully created
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await channel.send({
        content:
          'Welcome! We want to confirm that you are a university student...',
      })

      await interaction.reply({
        content: `Please check ${channel} to complete your verification.`,
        ephemeral: true,
      })
    } catch (error) {
      console.error('Channel creation error:', error)
      await interaction.reply({
        content: 'Sorry, there was an error creating your private channel.',
        ephemeral: true,
      })
    }
  },
}
