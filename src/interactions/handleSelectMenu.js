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

  // Construct the response text based on the selected values and question options
  const responseText = values
    .map((value) => {
      const option = question.options.find((opt) => opt.value === value)
      return option ? option.label : `Unknown option: ${value}` // Handle cases where the value might not be found
    })
    .join(', ')

  await interaction.reply({
    content: `Your ${questionId} has been ${
      userData.isNewResponse ? 'recorded' : 'updated'
    } to: "${responseText}"`,
    ephemeral: true,
  })

  const channel = await interaction.client.channels.fetch(userData.channelId)

  if (userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleSelectMenu
