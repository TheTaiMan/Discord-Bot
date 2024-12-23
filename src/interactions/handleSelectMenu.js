const showSummary = require('../utils/showSummery')
const sendNextQuestion = require('../utils/sendNextQuestion')

const UserManager = require('../UserManager')
const { questions } = require('../questions')
const removeSkipButton = require('../utils/removeSkipButton')

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

module.exports = handleSelectMenu
