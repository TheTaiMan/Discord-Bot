const { createQuestionModal } = require('../utils/modalBuilder')
const { questions } = require('../questions')
const UserManager = require('../utils/UserManager')
const { createPrivateChannel } = require('../utils/channelManager')
const {
  sendNextQuestion,
  handleModalSubmission,
  handleSelectMenuInteraction,
} = require('../utils/questionHandler')

// Handles the on boarding button press
const handleOnboarding = async (interaction) => {
  try {
    // Check if a channel already exists for this user
    const existingChannel = interaction.guild.channels.cache.find(
      (channel) => channel.name === `onboarding-${interaction.user.id}`
    )

    if (existingChannel) {
      // If channel exists, direct them to it
      await interaction.reply({
        content: `You already have an ongoing verification process. Please check ${existingChannel} to complete your verification.`,
        ephemeral: true,
      })
      return
    }

    // If no channel exists, create a new one
    const channel = await createPrivateChannel(interaction)
    const userData = UserManager.createUser(interaction.user.id, channel.id)

    // Welcome Message
    await channel.send({
      content:
        'Welcome! We want to confirm that you are a university student for you to be a member and have full access to the server.',
    })

    await sendNextQuestion(channel, userData)
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
      question.placeholder,
      question.inputStyle
    )
    await interaction.showModal(modal)
  }
}

const handleSubmit = async (interaction) => {
  const userData = UserManager.getUser(interaction.user.id)
  if (userData) {
    await interaction.update({
      content:
        'Form submitted successfully! Your responses are being reviewed.',
      components: [],
    })
    // ! Prints the user data
    UserManager.printUserData(interaction.user.id)

    UserManager.removeUser(interaction.user.id)
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'submit-form') {
        await handleSubmit(interaction)
      } else if (interaction.customId === 'start-onboarding') {
        await handleOnboarding(interaction)
      } else if (interaction.customId.endsWith('-question')) {
        await handleForm(interaction)
      }
    }

    if (interaction.isModalSubmit()) {
      await handleModalSubmission(interaction)
    }

    if (interaction.isStringSelectMenu()) {
      await handleSelectMenuInteraction(interaction)
    }
  },
}
