const { showSummary, sendNextQuestion } = require('../../utils/questionHandler')
const UserManager = require('../../utils/UserManager')

const handleModalSubmission = async (interaction) => {
  const questionId = interaction.customId.replace('-modal', '')
  const response = interaction.fields.getTextInputValue(
    `${questionId}-modal-input`
  )

  const userData = UserManager.updateUserResponse(
    interaction.user.id,
    questionId,
    response,
    'modal'
  )
  if (!userData) return

  const channel = await interaction.client.channels.fetch(userData.channelId)

  await interaction.reply({
    content: `Your ${questionId} has been ${
      userData.isNewResponse ? 'recorded' : 'updated'
    } to: "${response}"`,
    ephemeral: true,
  })

  if (userData.hasUpdatedResponse && userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleModalSubmission
