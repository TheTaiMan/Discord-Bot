const { questions, createQuestionButton } = require('./modalBuilder')
const UserManager = require('./UserManager')

async function sendNextQuestion(channel, userData) {
  const nextQuestion = questions[userData.currentQuestion]

  console.log('nextQuestion: ', nextQuestion)

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

// This is what happens when you submit the a form for a single question
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

  // ! Prints the Current User Data 
  UserManager.printUserData(interaction.user.id)

  // Add null check here
  if (!userData) {
    await interaction.reply({
      content:
        'Sorry, there was an error processing your response. Please try again.',
      ephemeral: true,
    })
    return
  }

  const channel = await interaction.client.channels.fetch(userData.channelId)
  await interaction.reply({ content: 'Response recorded!', ephemeral: true })

  if (userData.isComplete()) {
    await channel.send({
      content: 'Form completed! Your responses are being reviewed.',
      components: [],
    })

    // ! Removes the user but I want to send to Notion here
    UserManager.removeUser(interaction.user.id)
  } else {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = { sendNextQuestion, handleModalSubmission }
