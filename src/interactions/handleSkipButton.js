const UserManager = require('../UserManager')
const sendNextQuestion = require('../utils/sendNextQuestion')
const removeSkipButton = require('../utils/removeSkipButton')
const showSummary = require('../utils/showSummery')
const { questions } = require('../questions')

const handleSkipButton = async (interaction) => {
  const questionId = interaction.customId.replace('skip-', '')
  const userData = UserManager.getUser(interaction.user.id)
  if (!userData) return

  // Use the skipQuestion method from UserManager
  const skipResult = UserManager.skipQuestion(interaction.user.id, questionId)
  if (!skipResult) return

  await interaction.reply({
    content: `This question has been ${
      skipResult.hasUpdatedResponse ? 'changed to skipped' : 'skipped'
    }.`,
    ephemeral: true,
  })

  // Remove the skip button from the message
  await removeSkipButton(interaction.message)

  const channel = await interaction.client.channels.fetch(userData.channelId)

  // If we have all questions answered (including skipped ones), show summary
  if (Object.keys(userData.responses).length === questions.length) {
    await showSummary(channel, userData)
  }
  // If this was a new response (not updating an existing one), proceed to next question
  else if (skipResult.isNewResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleSkipButton
