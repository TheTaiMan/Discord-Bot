const UserManager = require('../UserManager')
const sendNextQuestion = require('../utils/sendNextQuestion')
const removeSkipButton = require('../utils/removeSkipButton')
const showSummary = require('../utils/showSummery')

const handleSkipButton = async (interaction) => {
  const questionId = interaction.customId.replace('skip-', '')
  const userData = UserManager.getUser(interaction.user.id)
  if (!userData) return

  const skipResult = UserManager.skipQuestion(interaction.user.id, questionId)
  if (!skipResult) return

  await interaction.reply({
    content: `This question has been ${
      skipResult.hasUpdatedResponse ? 'changed to skipped' : 'skipped'
    }.`,
    ephemeral: true,
  })

  await removeSkipButton(interaction.message)

  const channel = await interaction.client.channels.fetch(userData.channelId) // Revert to fetch

  if (userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (skipResult.isNewResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleSkipButton
