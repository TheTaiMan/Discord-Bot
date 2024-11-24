const { questions, createQuestionModal } = require('../utils/modalBuilder')
const UserManager = require('../utils/UserManager')
const { createPrivateChannel } = require('../utils/channelManager')
const {
  sendNextQuestion,
  handleModalSubmission,
} = require('../utils/questionHandler')


// Handles the on boarding button press
const handleOnboarding = async (interaction) => {
  try {
    const channel = await createPrivateChannel(interaction)
    const userData = UserManager.createUser(interaction.user.id, channel.id) // Creates new UserData class instance

    // Welcome Message
    await channel.send({
      content:
        'Welcome! We want to confirm that you are a university student for you to be a member and have full access to the server.',
    })

    await sendNextQuestion(channel, userData) // Sends a message to the new private text channel for the user and the bot
    await interaction.reply({
      content: `Please check ${channel} to complete your verification.`,
      ephemeral: true,
    })
  } catch (error) {
    console.error('Channel creation error:', error)
    await interaction.reply({
      content: 'Sorry, there was an error creating your private channel.',
      ephemeral: true,
    })
  }
}

// Handles question button press
const handleForm = async (interaction) => {
  const questionId = interaction.customId.replace('-question', '')
  const question = questions.find((q) => q.id === questionId)
  if (question) {
    const modal = createQuestionModal(
      `${questionId}-modal`,
      question.modalTitle,
      question.modalLabel,
      question.placeholder
    )
    await interaction.showModal(modal)
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      const isOnBoarding = interaction.customId === 'start-onboarding'
      const isOnForm = interaction.customId.endsWith('-question')

      if (isOnBoarding) {
        handleOnboarding(interaction)
      } else if (isOnForm) {
        handleForm(interaction)
      }
    }

    // When you press the submit button for a question modal (form)
    if (interaction.isModalSubmit()) {
      await handleModalSubmission(interaction)
    }
  },
}
