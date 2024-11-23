// events/interactionCreate.js
const { ChannelType, PermissionFlagsBits } = require('discord.js')
const {
  createQuestionModal,
  createQuestionButton,
  questions,
} = require('../utils/modalBuilder')
const UserManager = require('../utils/UserManager')

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

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'start-onboarding') {
        try {
          const channel = await interaction.guild.channels.create({
            name: `onboarding-${interaction.user.id}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel],
              },
              {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel],
                deny: [PermissionFlagsBits.SendMessages],
              },
              {
                id: interaction.client.user.id,
                allow: [
                  PermissionFlagsBits.ViewChannel,
                  PermissionFlagsBits.SendMessages,
                ],
              },
            ],
          })

          // Create new user data using UserManager
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
      const questionId = interaction.customId.replace('-modal', '')
      const response = interaction.fields.getTextInputValue(
        `${questionId}-modal-input`
      )

      // Update user response using UserManager
      const userData = UserManager.updateUserResponse(
        interaction.user.id,
        questionId,
        response
      )
      const channel = await interaction.client.channels.fetch(
        userData.channelId
      )

      await interaction.reply({
        content: 'Response recorded!',
        ephemeral: true,
      })

      // Check if form is complete
      if (userData.isComplete()) {
        await channel.send({
          content: 'Form completed! Your responses are being reviewed.',
          components: [],
        })
        // Optionally remove user data after completion
        UserManager.removeUser(interaction.user.id)
      } else {
        await sendNextQuestion(channel, userData)
      }
    }
  },
}
