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

  console.log(`User ${interaction.user.id} - isComplete: ${userData.isComplete()}, hasUpdatedResponse: ${userData.hasUpdatedResponse}`)
  
  if (userData.isComplete()) {
    // Always show updated summary when user is complete
    console.log('Showing updated summary for complete user')
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    // Only continue to next question if user hasn't updated and isn't complete
    console.log('Sending next question')
    await sendNextQuestion(channel, userData)
  } else {
    console.log('User updated response but is not complete - no action taken')
  }
}

module.exports = handleModalSubmission
