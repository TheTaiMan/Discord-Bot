const {
  questions,
  createQuestionButton,
  ButtonStyle,
} = require('./modalBuilder')
const UserManager = require('./UserManager')

async function sendNextQuestion(channel, userData) {
  const nextQuestion = questions[userData.currentQuestion]

  if (userData.isComplete()) {
    // Show summary and update options
    const responsesSummary = Object.entries(userData.responses)
      .map(
        ([key, value]) =>
          `**${key.charAt(0).toUpperCase() + key.slice(1)}**: ${value}`
      )
      .join('\n')

    const updateButtons = questions.map((q) =>
      createQuestionButton(
        `${q.id}-question`,
        `Update ${q.modalTitle}`,
        ButtonStyle.Secondary
      )
    )

    // Add submit button
    updateButtons.push(
      createQuestionButton('submit-form', 'Submit Form', ButtonStyle.Success)
    )

    await channel.send({
      content: `Here's your information:\n${responsesSummary}\n\nWould you like to update anything?`,
      components: updateButtons,
    })
  } else {
    // Show only current question button
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
  if (!userData) return

  const channel = await interaction.client.channels.fetch(userData.channelId)

  // Show what was updated with the new value
  await interaction.reply({
    content: `Your ${questionId} has been ${
      userData.isNewResponse ? 'recorded' : 'updated'
    } to: "${response}"`,
    ephemeral: true,
  })

  if (userData.hasUpdatedResponse && userData.isComplete()) {
    // Show all responses and submit button after update
    const responsesSummary = Object.entries(userData.responses)
      .map(
        ([key, value]) =>
          `**${key.charAt(0).toUpperCase() + key.slice(1)}**: ${value}`
      )
      .join('\n')

    await channel.send({
      content: `Here's your updated information:\n${responsesSummary}\n\nWould you like to submit now?`,
      components: [
        createQuestionButton('submit-form', 'Submit Form', ButtonStyle.Success),
      ],
    })
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = { sendNextQuestion, handleModalSubmission }
