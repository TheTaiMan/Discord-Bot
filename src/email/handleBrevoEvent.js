const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const { STATUS_MESSAGES, updateStatusMessage } = require('./emailStatusManager')
const UserManager = require('../UserManager')

async function handleBrevoEvent(eventType, recipientEmail, userData, channel) {
  // Skip if delivered status already received
  if (userData.lastEmailStatus === 'delivered' && eventType === 'request') {
    console.log('Skipping event type:', eventType)
    return
  }

  // Update status message
  const statusContent = STATUS_MESSAGES[eventType]
  if (!statusContent) {
    console.warn(`Unknown event type: ${eventType}`)
    return
  }

  try {
    const newStatusMessageId = await updateStatusMessage(
      channel,
      userData.statusMessageId,
      statusContent
    )

    if (newStatusMessageId !== userData.statusMessageId) {
      userData.setStatusMessageId(newStatusMessageId)
    }

    // update email status
    userData.updateEmailStatus(eventType)
    console.log('event type: ' + eventType)
    UserManager.printAllUserData()

    // Handle specific event types
    switch (eventType) {
      case 'delivered':
        await createVerificationPrompt(channel)
        break
      case 'error':
      case 'invalid_email':
      case 'hard_bounce':
      case 'blocked':
        userData.resetEmailVerification()
        await createRetryPrompt(channel)
        break
    }
  } catch (error) {
    console.error('Error handling Brevo event:', error)
  }
}

async function createVerificationPrompt(channel) {
  const enterCodeButton = new ButtonBuilder()
    .setCustomId('enter-verification-code')
    .setLabel('Enter Verification Code')
    .setStyle(ButtonStyle.Primary)

  const resendButton = new ButtonBuilder()
    .setCustomId('resend-verification-code')
    .setLabel('Resend Code')
    .setStyle(ButtonStyle.Secondary)

  const row = new ActionRowBuilder().addComponents(
    enterCodeButton,
    resendButton
  )

  await channel.send({
    content:
      'Ready to verify your email? Enter the verification code sent to your inbox.',
    components: [row],
    ephemeral: false,
  })
}

async function createRetryPrompt(channel) {
  const editEmailButton = new ButtonBuilder()
    .setCustomId('edit-email')
    .setLabel('Enter New Email')
    .setStyle(ButtonStyle.Primary)

  const row = new ActionRowBuilder().addComponents(editEmailButton)

  await channel.send({
    content: 'Please enter a different email address.',
    components: [row],
    ephemeral: false,
  })
}

module.exports = handleBrevoEvent
