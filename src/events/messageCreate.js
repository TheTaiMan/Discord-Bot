const {
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')

module.exports = {
  name: 'messageCreate',
  async execute(msg) {
    if (msg.content === '!setup-onboarding') { // ! Make sure user has proper permissions
      const channel = await msg.guild.channels.create({
        name: 'onboarding',
        type: ChannelType.GuildText,
      })

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('start-onboarding')
          .setLabel('Start Onboarding')
          .setStyle(ButtonStyle.Primary)
      )

      await channel.send({
        content:
          'Welcome to the server! Click the button below to start the onboarding process.',
        components: [row],
      })
      console.log('Onboarding channel and welcome message created!')
    }
  },
}
