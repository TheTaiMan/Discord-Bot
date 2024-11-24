const { questions, createQuestionButton } = require('./modalBuilder')
const UserManager = require('./UserManager')

async function sendNextQuestion(channel, userData) {
  const nextQuestion = questions[userData.currentQuestion]

  if (!nextQuestion) {
    await channel.send({
      content:
        'Thank you for completing the form! Your responses are being reviewed.',
      components: [],
    })
    return
  }

  await channel.send({
    content: nextQuestion.question,
    components: [
      createQuestionButton(
        `${nextQuestion.id}-question`,
        nextQuestion.buttonLabel
      ),
    ],
  })
}

async function handleModalSubmission(interaction) {
  const questionId = interaction.customId.replace('-modal', '')
  const response = interaction.fields.getTextInputValue(
    `${questionId}-modal-input`
  )

  const userData = UserManager.updateUserResponse(
    interaction.user.id,
    questionId,
    response
  )

  const channel = await interaction.client.channels.fetch(userData.channelId)
  await interaction.reply({ content: 'Response recorded!', ephemeral: true })

  if (userData.isComplete()) {
    await channel.send({
      content: 'Form completed! Your responses are being reviewed.',
      components: [],
    })
    UserManager.removeUser(interaction.user.id)
  } else {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = { sendNextQuestion, handleModalSubmission }
