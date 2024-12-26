// src/email/handleBrevoEvent.js
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')

async function handleBrevoEventActions(
  eventType,
  interaction,
  channel,
  userData
) {
  const contentMap = {
    request: 'Verification email sent.',
    soft_bounce:
      "Verification email soft bounced. There might be a temporary issue with the recipient's inbox.",
    hard_bounce:
      'Verification email hard bounced. Please check the email address you entered.',
    error: 'An error occurred while sending the verification email.',
    deferred: 'Verification email delivery is temporarily deferred.',
    blocked: 'Verification email was blocked.',
    invalid_email: 'Invalid email address. Please enter a valid email.',
  }

  const content = contentMap[eventType]

  if (interaction && interaction.editReply) {
    await interaction.editReply({ content, components: [] })
  } else if (channel && content) {
    await channel.send({ content })
  }
}

async function handleBrevoEvent(
  eventType,
  recipientEmail,
  userData,
  interaction,
  channel
) {
  switch (eventType) {
    case 'request':
    case 'soft_bounce':
    case 'hard_bounce':
    case 'error':
    case 'deferred':
    case ' invalid_email':
    case 'blocked':
      await handleBrevoEventActions(eventType, interaction, channel, userData)
      userData.verificationStatus = eventType
      break
    case 'delivered':
      const enterCodeButton = new ButtonBuilder()
        .setCustomId('enter-verification-code')
        .setLabel('Enter Verification Code')
        .setStyle(ButtonStyle.Primary)
      const row = new ActionRowBuilder().addComponents(enterCodeButton)
      await channel.send({
        content: 'Verification email delivered! Ready to verify your email?',
        components: [row],
      })
      userData.verificationStatus = 'delivered'
      // Clear the interaction so subsequent edits don't interfere
      UserManager.setVerificationInteraction(userData.userId, null)
      break
    default:
      console.log('Unknown Brevo event:', eventType)
  }
}

module.exports = handleBrevoEvent
