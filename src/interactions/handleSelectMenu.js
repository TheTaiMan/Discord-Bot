const showSummary = require('../utils/showSummery')
const sendNextQuestion = require('../utils/sendNextQuestion')

const UserManager = require('../UserManager')
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

  if (userData.hasUpdatedResponse && userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    const channel = await interaction.client.channels.fetch(userData.channelId)
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleSelectMenu
