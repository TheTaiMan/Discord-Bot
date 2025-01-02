const showSummary = require('../utils/showSummery')
const sendNextQuestion = require('../utils/sendNextQuestion')
const handleEmailVerificationFlow = require('../email/handleEmailVerificationFlow')
const UserManager = require('../UserManager')
const { questions } = require('../questions')

const handleModalSubmission = async (interaction) => {
  const questionId = interaction.customId.replace('-modal', '')
  const response = interaction.fields.getTextInputValue(
    `${questionId}-modal-input`
  )
  const question = questions.find((q) => q.id === questionId)

  const userData = UserManager.getUser(interaction.user.id)
  if (!userData) return

  const channel = await interaction.client.channels.fetch(userData.channelId)

  // Handle email verification flow
  if (question && question.id === 'email') {
    await handleEmailVerificationFlow(interaction, userData, response)
    return
  }

  // For other questions, update the response and proceed
  UserManager.updateUserResponse(
    interaction.user.id,
    questionId,
    response,
    'modal'
  )
  await interaction.reply({
    content: `Your ${questionId} has been recorded as: "${response}"`,
    ephemeral: true,
  })

  if (userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleModalSubmission
