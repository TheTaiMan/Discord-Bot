const { showSummary, sendNextQuestion } = require('../../utils/questionHandler')
const UserManager = require('../../utils/UserManager')
const { questions } = require('../../questions')

const handleSelectMenu = async (interaction) => {
  // Remove both '-select' and '-update' from the ID to get the base questionId
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

  if (userData.hasUpdatedResponse && userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleSelectMenu
