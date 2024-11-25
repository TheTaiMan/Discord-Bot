const {
  createQuestionButton,
  createSelectMenu, // Add this import
  ButtonStyle,
} = require('./modalBuilder')
const UserManager = require('./UserManager')
const { questions } = require('../questions')

async function handleModalSubmission(interaction) {
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

async function handleSelectMenuInteraction(interaction) {
  const questionId = interaction.customId.replace('-select', '')
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

async function sendNextQuestion(channel, userData) {
  const nextQuestion = questions[userData.currentQuestion]

  if (userData.isComplete()) {
    await showSummary(channel, userData)
  } else {
    let components
    switch (nextQuestion.type) {
      case 'modal':
        components = [
          createQuestionButton(
            `${nextQuestion.id}-question`,
            nextQuestion.buttonLabel,
            ButtonStyle.Primary
          ),
        ]
        break
      case 'select':
      case 'multiSelect':
        components = [createSelectMenu(nextQuestion)]
        break
    }

    await channel.send({
      content: nextQuestion.question,
      components,
    })
  }
}

async function showSummary(channel, userData) {
  const responsesSummary = Object.entries(userData.responses)
    .map(
      ([key, value]) =>
        `**${key.charAt(0).toUpperCase() + key.slice(1)}**: ${value}`
    )
    .join('\n')

  const updateComponents = []

  // Add update buttons/menus one at a time
  for (const q of questions) {
    if (q.type === 'modal') {
      updateComponents.push(
        createQuestionButton(
          `${q.id}-question`,
          `Update ${q.modalTitle}`,
          ButtonStyle.Secondary
        )
      )
    } else {
      updateComponents.push(
        createSelectMenu({
          ...q,
          id: `${q.id}-update`,
        })
      )
    }
  }

  // Add submit button as the last component
  updateComponents.push(
    createQuestionButton('submit-form', 'Submit Form', ButtonStyle.Success)
  )

  await channel.send({
    content: `Here's your information:\n${responsesSummary}\n\nWould you like to update anything?`,
    components: updateComponents,
  })
}

module.exports = {
  sendNextQuestion,
  handleModalSubmission,
  handleSelectMenuInteraction,
  showSummary,
}
