const showSummary = require('../utils/showSummery')
const sendNextQuestion = require('../utils/sendNextQuestion')

const UserManager = require('../UserManager')
const { questions } = require('../questions')
const removeSkipButton = require('../utils/removeSkipButton')

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

  // Specifically check if this question is NOT required and it's not the last question
  if (
    question &&
    !question.required &&
    userData.currentQuestion < questions.length
  ) {
    await removeSkipButton(latestMessage)
  }

  if (userData.hasUpdatedResponse && userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleModalSubmission
