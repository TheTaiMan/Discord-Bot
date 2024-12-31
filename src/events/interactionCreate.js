// src/events/interactionCreate.js
const handleOnboarding = require('../interactions/handleOnboarding')
const handleModal = require('../interactions/handleModal')
const handleSkipButton = require('../interactions/handleSkipButton')
const handleSubmit = require('../interactions/handleSubmit')
const handleModalSubmission = require('../interactions/handleModalSubmission')
const handleSelectMenu = require('../interactions/handleSelectMenu')
const handleSendCode = require('../email/handleSendCode')
const handleVerifyCode = require('../email/handleVerifyCode')
const createModal = require('../components/createModal')
const createVerificationCodeModal = require('../components/createVerificationCodeModal') // Import the new function
const { questions } = require('../questions')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction)
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'verify-code-modal') {
        await handleVerifyCode(interaction)
      } else {
        await handleModalSubmission(interaction)
      }
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction)
    }
  },
}

async function handleButtonInteraction(interaction) {
  const { customId } = interaction
  if (customId === 'start-onboarding') {
    await handleOnboarding(interaction)
  } else if (customId.endsWith('-question')) {
    await handleModal(interaction)
  } else if (customId.startsWith('skip-')) {
    await handleSkipButton(interaction)
  } else if (customId === 'submit-form') {
    await handleSubmit(interaction)
  } else if (customId === 'send-verification-code') {
    // Defer the reply immediately and then call handleSendCode
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true })
      await handleSendCode(interaction)
    }
  } else if (customId === 'resend-verification-code') {
    // Defer the reply immediately and then call handleSendCode
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true })
      await handleSendCode(interaction)
    }
  } else if (customId === 'enter-verification-code') {
    const modal = createVerificationCodeModal()
    await interaction.showModal(modal)
  } else if (customId === 'edit-email') {
    // Re-open the email modal
    const emailQuestion = questions.find((q) => q.id === 'email')
    if (emailQuestion) {
      const modal = createModal(
        'email-modal',
        emailQuestion.modalTitle,
        emailQuestion.modalLabel,
        emailQuestion.placeholder,
        emailQuestion.inputStyle,
        emailQuestion.required
      )
      await interaction.showModal(modal)
    }
  }
}
