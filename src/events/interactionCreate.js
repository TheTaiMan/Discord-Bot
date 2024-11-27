const { createQuestionModal } = require('../utils/modalBuilder')
const { questions } = require('../questions')
const UserManager = require('../utils/UserManager')
const { createPrivateChannel } = require('../utils/channelManager')
const {
  sendNextQuestion,
  handleModalSubmission,
  handleSelectMenuInteraction,
} = require('../utils/questionHandler')

const handleOnboarding = require('./interactions/handleOnboarding')
const handleModal = require('./interactions/handleModal')
const handleSubmit = require('./interactions/handleSubmit')
const handleSkipButton = require('./interactions/handleSkipButton')

const { ButtonBuilder, ActionRowBuilder } = require('discord.js')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      if (interaction.customId === 'submit-form') {
        await handleSubmit(interaction)
      } else if (interaction.customId === 'start-onboarding') {
        await handleOnboarding(interaction)
      } else if (interaction.customId.startsWith('skip-')) {
        await handleSkipButton(interaction)
      } else if (interaction.customId.endsWith('-question')) {
        await handleModal(interaction)
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
