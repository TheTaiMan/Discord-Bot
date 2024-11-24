const {
  questions,
  createQuestionModal,
} = require('../utils/modalBuilder')
const UserManager = require('../utils/UserManager')
const { createPrivateChannel } = require('../utils/channelManager')
const {
  sendNextQuestion,
  handleModalSubmission,
} = require('../utils/questionHandler')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'start-onboarding') {
        try {
          const channel = await createPrivateChannel(interaction)
          const userData = UserManager.createUser(
            interaction.user.id,
            channel.id
          )

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
      } else if (interaction.customId.endsWith('-question')) {
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
    }

    if (interaction.isModalSubmit()) {
      await handleModalSubmission(interaction)
    }
  },
}
