const showSummary = require('../components/showSummery')
const { sendNextQuestion } = require('../utils/questionHandler')
const UserManager = require('../utils/UserManager')
const { ActionRowBuilder } = require('discord.js')
const { questions } = require('../questions')

const handleSelectMenu = async (interaction) => {
  const questionId = interaction.customId
    .replace(/-select$/, '')
    .replace(/-update$/, '')

  const values = interaction.values
  const question = questions.find((q) => q.id === questionId)

  const userData = UserManager.getUser(interaction.user.id)
  if (!userData || !question) return

  userData.updateResponse(questionId, values, question.type)

  const responseText = Array.isArray(values)
    ? values
        .map((v) => question.options.find((opt) => opt.value === v).label)
        .join(', ')
    : question.options.find((opt) => opt.value === values).label

  await interaction.reply({
    content: `Your ${questionId} has been ${
      userData.isNewResponse ? 'recorded' : 'updated'
    } to: "${responseText}"`,
    ephemeral: true,
  })

  const channel = await interaction.client.channels.fetch(userData.channelId)
  const messages = await channel.messages.fetch({ limit: 1 })
  const latestMessage = messages.first()

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

module.exports = handleSelectMenu
