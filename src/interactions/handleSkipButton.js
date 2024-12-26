const UserManager = require('../UserManager')
const sendNextQuestion = require('../utils/sendNextQuestion')
const removeSkipButton = require('../utils/removeSkipButton')

const handleSkipButton = async (interaction) => {
  const questionId = interaction.customId.replace('skip-', '')
  const userData = UserManager.getUser(interaction.user.id)
  if (!userData) return

  // Check if the question was already answered before
  const wasQuestionAnswered = userData.responses.hasOwnProperty(questionId) &&
    userData.responses[questionId] !== 'Skipped'

  // Skip the question (regardless of whether it was answered before)
  UserManager.skipQuestion(interaction.user.id, questionId)

  await interaction.reply({
    content: `Question "${questionId}" has been ${wasQuestionAnswered ? 'changed to skipped' : 'skipped'}.`,
    ephemeral: true
  })

  // Remove the skip button using the utility function
  await removeSkipButton(interaction.message)

  // Only send next question if we're on the current question
  if (!wasQuestionAnswered) {
    const channel = await interaction.client.channels.fetch(userData.channelId)
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleSkipButton