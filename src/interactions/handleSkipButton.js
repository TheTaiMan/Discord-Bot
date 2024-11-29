const { ButtonBuilder, ActionRowBuilder } = require('discord.js')
const UserManager = require('../UserManager')
const sendNextQuestion = require('../components/sendNextQuestion')


const handleSkipButton = async (interaction) => {
  const questionId = interaction.customId.replace('skip-', '')
  const userData = UserManager.getUser(interaction.user.id)
  if (!userData) return

  UserManager.skipQuestion(interaction.user.id, questionId)

  // Create a new ActionRow with the original buttons, but with the skip button disabled
  const updatedComponents = interaction.message.components[0].components.map(
    (component) => {
      if (component.customId.startsWith('skip-')) {
        return ButtonBuilder.from(component).setDisabled(true)
      }
      return component
    }
  )

  const updatedRow = new ActionRowBuilder().addComponents(...updatedComponents)

  // Update the message, keeping all buttons but disabling the skip button
  await interaction.update({
    components: [updatedRow],
  })

  const channel = await interaction.client.channels.fetch(userData.channelId)
  await sendNextQuestion(channel, userData)
}

module.exports = handleSkipButton
