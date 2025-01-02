const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const UserManager = require('../UserManager')

const STATUS_MESSAGES = {
  request: 'Verification code sent, awaiting delivery...',
  sent: 'Verification code sent, awaiting delivery...',
  delivered: 'Verification email delivered successfully!',
  soft_bounce:
    'Temporary delivery issue. Please try again or use a different email.',
  hard_bounce: 'Email delivery failed. Please check the address and try again.',
  invalid_email: 'Invalid email address. Please enter a valid email.',
  error: 'An error occurred while sending the verification email.',
  deferred: 'Email delivery delayed. Please wait a moment...',
  blocked: 'Email was blocked. Please try a different address.',
}

async function updateStatusMessage(channel, messageId, content) {
  if (!messageId) {
    const newMessage = await channel.send({
      content,
      ephemeral: true,
    })
    return newMessage.id
  }

  try {
    const message = await channel.messages.fetch(messageId)
    await message.edit({ content, ephemeral: true })
    return messageId
  } catch (error) {
    console.error('Failed to update status message:', error)
    const newMessage = await channel.send({
      content,
      ephemeral: true,
    })
    return newMessage.id
  }
}

async function handleBrevoEvent(eventType, recipientEmail, userData, channel) {
  // Map 'request' event to 'sent' for status tracking
  const trackingEventType = eventType === 'request' ? 'sent' : eventType

  // Skip processing if we already have a "delivered" status and receive a "sent"
  if (!userData.updateEmailStatus(trackingEventType)) {
    console.log(`Skipping event: ${eventType} for ${recipientEmail}`)
    return
  }

  const statusContent = STATUS_MESSAGES[eventType]
  if (!statusContent) {
    console.warn(`Unknown event type: ${eventType}`)
    return
  }

  UserManager.printAllUserData()
  // Update or create status message
  try {
    const newStatusMessageId = await updateStatusMessage(
      channel,
      userData.statusMessageId,
      statusContent
    )

    // Update the stored message ID if it changed
    if (newStatusMessageId !== userData.statusMessageId) {
      userData.setStatusMessageId(newStatusMessageId)
    }

    // Handle specific event types
    switch (eventType) {
      case 'delivered':
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

        console.log(recipientEmail + ' verification status: ' + eventType)
        UserManager.printAllUserData()

        await channel.send({
          content:
            'Ready to verify your email? Enter the verification code sent to your inbox.',
          components: [row],
          ephemeral: false,
        })
        break

      case 'error':
      case 'invalid_email':
      case 'hard_bounce':
      case 'blocked':
        userData.resetEmailVerification()
        console.log(
          recipientEmail + ' User reset email verification status: ' + eventType
        )
        UserManager.printAllUserData()

        const editEmailButton = new ButtonBuilder()
          .setCustomId('edit-email')
          .setLabel('Enter New Email')
          .setStyle(ButtonStyle.Primary)

        const errorRow = new ActionRowBuilder().addComponents(editEmailButton)

        await channel.send({
          content: 'Please enter a different email address.',
          components: [errorRow],
          ephemeral: false,
        })
        break
    }
  } catch (error) {
    console.error('Error handling Brevo event:', error)
  }
}

module.exports = handleBrevoEvent
