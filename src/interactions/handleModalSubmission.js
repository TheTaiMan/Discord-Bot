const { showSummary, sendNextQuestion } = require('../utils/questionHandler')
const UserManager = require('../utils/UserManager')
const { ActionRowBuilder } = require('discord.js')
const { questions } = require('../questions')

const handleModalSubmission = async (interaction) => {
  const questionId = interaction.customId.replace('-modal', '')
  const response = interaction.fields.getTextInputValue(
    `${questionId}-modal-input`
  )

  const question = questions.find((q) => q.id === questionId)

  const userData = UserManager.updateUserResponse(
    interaction.user.id,
    questionId,
    response,
    'modal'
  )
  if (!userData) return

  const channel = await interaction.client.channels.fetch(userData.channelId)

  // Find the most recent message in the channel
  const messages = await channel.messages.fetch({ limit: 1 })
  const latestMessage = messages.first()

  await interaction.reply({
    content: `Your ${questionId} has been ${
      userData.isNewResponse ? 'recorded' : 'updated'
    } to: "${response}"`,
    ephemeral: true,
  })

  // Specifically check if this question is NOT required
  if (question && !question.required) {
    // Ensure the message has components and they're not empty
    if (latestMessage.components && latestMessage.components.length > 0) {
      // Create a new action row without the skip button
      const updatedComponents = latestMessage.components[0].components.filter(
        (component) => !component.customId.startsWith('skip-')
      )

      // If there are still components, create a new ActionRow
      if (updatedComponents.length > 0) {
        await latestMessage.edit({
          components: [
            new ActionRowBuilder().addComponents(...updatedComponents),
          ],
        })
      } else {
        // If no components remain, clear them completely
        await latestMessage.edit({ components: [] })
      }
    }
  }

  if (userData.hasUpdatedResponse && userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleModalSubmission
