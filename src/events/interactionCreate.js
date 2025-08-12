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
    await handleSendCode(interaction)
  } else if (customId === 'resend-verification-code') {
    await handleSendCode(interaction) // Reuse handleSendCode for resend
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
  } else if (customId === 'continue-onboarding') {
    await handleContinueOnboarding(interaction)
  } else if (customId === 'end-onboarding') {
    await handleEndOnboarding(interaction)
  }
}

async function handleContinueOnboarding(interaction) {
  const UserManager = require('../UserManager')
  const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
  const userData = UserManager.getUser(interaction.user.id)
  
  if (!userData) {
    await interaction.reply({
      content: 'User data not found. Please start the onboarding process again.',
      flags: require('discord.js').MessageFlags.Ephemeral,
    })
    return
  }

  // Disable the Continue button and keep End Onboarding active
  const disabledContinueButton = new ButtonBuilder()
    .setCustomId('continue-onboarding-disabled')
    .setLabel('Continue')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true)
  
  const endButton = new ButtonBuilder()
    .setCustomId('end-onboarding')
    .setLabel('End Onboarding')
    .setStyle(ButtonStyle.Danger)
  
  const updatedRow = new ActionRowBuilder().addComponents(disabledContinueButton, endButton)

  // Update the original message to disable the Continue button
  await interaction.update({
    components: [updatedRow]
  })

  // Move to the next question (skip the confirmation question)
  userData.currentQuestion = 1
  const sendNextQuestion = require('../utils/sendNextQuestion')
  
  await sendNextQuestion(interaction.channel, userData)
}

async function handleEndOnboarding(interaction) {
  const UserManager = require('../UserManager')
  const selfDestruct = require('../utils/selfDestruct')
  const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
  
  // Find user data based on the channel name (onboarding-{userId})
  const channelName = interaction.channel.name
  const userIdMatch = channelName.match(/onboarding-(\d+)/)
  
  if (!userIdMatch) {
    await interaction.reply({
      content: 'This is not a valid onboarding channel.',
      flags: require('discord.js').MessageFlags.Ephemeral,
    })
    return
  }
  
  const targetUserId = userIdMatch[1]
  const userData = UserManager.getUser(targetUserId)

  // Disable both buttons immediately
  const disabledContinueButton = new ButtonBuilder()
    .setCustomId('continue-onboarding-disabled')
    .setLabel('Continue')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true)
  
  const disabledEndButton = new ButtonBuilder()
    .setCustomId('end-onboarding-disabled')
    .setLabel('End Onboarding')
    .setStyle(ButtonStyle.Danger)
    .setDisabled(true)
  
  const disabledRow = new ActionRowBuilder().addComponents(disabledContinueButton, disabledEndButton)

  // Self-destruct: Clean up user data and use the existing self-destruct method
  try {
    // Update the message to disable both buttons, then reply
    await interaction.update({
      components: [disabledRow]
    })
    
    await interaction.followUp({
      content: '# Onboarding Cancelled\n\nThank you for your time!',
      flags: require('discord.js').MessageFlags.Ephemeral,
    })
    
    // Use the existing self-destruct method (same as completion)
    // selfDestruct will handle user cleanup automatically
    await selfDestruct(interaction.channel, targetUserId)
  } catch (error) {
    console.error('Error handling end onboarding:', error)
  }
}
