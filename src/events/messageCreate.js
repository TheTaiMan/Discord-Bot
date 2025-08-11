const {
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js')

module.exports = {
  name: 'messageCreate',
  async execute(msg) {
    if (msg.content === '!setup-onboarding') {
      // Check if user has administrator permissions
      if (!msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
        await msg.reply('You need administrator permissions to use this command.')
        return
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('start-onboarding')
          .setLabel('Start Onboarding')
          .setStyle(ButtonStyle.Primary)
      )

      await msg.channel.send({
        content:
          "# Welcome to the server!\nClick the button below to start the onboarding process.",
        components: [row],
      })
      console.log('Onboarding welcome message sent!')
    }
  },
}
