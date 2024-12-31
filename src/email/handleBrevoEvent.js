const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const UserManager = require('../UserManager')
const createEditEmailButton = require('../components/createEditEmailButton')

async function handleBrevoEventActions(
  eventType,
  interaction,
  channel,
  userData
) {
  const contentMap = {
    request: 'Email sent successfully.',
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

  if (interaction && userData.verificationMessageId) {
    try {
      await interaction.editReply({ content, components: [] })
    } catch (error) {
      console.error('Error editing reply for Brevo event:', error)
      if (channel && content) {
        await channel.send({ content })
      }
    }
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
  if (eventType === 'request' && userData.verificationStatus === 'delivered') {
    console.log(
      'Ignoring request event as delivered event was already processed.'
    )
    return
  }

  switch (eventType) {
    case 'request':
      await handleBrevoEventActions(eventType, interaction, channel, userData)
      userData.verificationStatus = 'request_sent'
      UserManager.printAllUserData()
      break
    case 'soft_bounce':
    case 'hard_bounce':
    case 'error':
    case 'deferred':
    case 'invalid_email':
    case 'blocked':
      if (interaction && userData.verificationMessageId) {
        try {
          const editButton = createEditEmailButton()
          await interaction.editReply({
            content: handleBrevoEventErrorMessage(eventType),
            components: [new ActionRowBuilder().addComponents(editButton)],
          })
        } catch (error) {
          console.error('Error editing reply for error Brevo event:', error)
          if (channel) {
            const editButton = createEditEmailButton()
            await channel.send({
              content: handleBrevoEventErrorMessage(eventType),
              components: [new ActionRowBuilder().addComponents(editButton)],
            })
          }
        }
      } else if (channel) {
        const editButton = createEditEmailButton()
        await channel.send({
          content: handleBrevoEventErrorMessage(eventType),
          components: [new ActionRowBuilder().addComponents(editButton)],
        })
      }
      userData.verificationStatus = eventType
      UserManager.printAllUserData()
      break
    case 'delivered':
      userData.verificationStatus = 'delivered'
      UserManager.printAllUserData()

      if (interaction && userData.verificationMessageId) {
        try {
          await interaction.editReply({
            content:
              'Email delivered successfully. Enter your verification code.',
            components: [
              new ActionRowBuilder()
                .addComponents(
                  new ButtonBuilder()
                    .setCustomId('enter-verification-code')
                    .setLabel('Enter Code')
                    .setStyle(ButtonStyle.Primary),
                  userData.emailSendCount < 3
                    ? new ButtonBuilder()
                        .setCustomId('resend-verification-code')
                        .setLabel('Resend Code')
                        .setStyle(ButtonStyle.Secondary)
                    : null
                )
                .components.filter(Boolean),
            ],
          })
        } catch (error) {
          console.error('Error editing reply for delivered event:', error)
          if (channel) {
            await channel.send({
              content:
                'Verification email delivered! Enter your verification code:',
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('enter-verification-code')
                    .setLabel('Enter Code')
                    .setStyle(ButtonStyle.Primary)
                ),
              ],
            })
          }
        } finally {
          UserManager.setVerificationInteraction(userData.userId, null)
          userData.verificationMessageId = null
        }
      } else if (channel) {
        await channel.send({
          content:
            'Verification email delivered! Enter your verification code:',
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('enter-verification-code')
                .setLabel('Enter Code')
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        })
      }
      break
    default:
      console.log('Unknown Brevo event:', eventType)
  }
}

function handleBrevoEventErrorMessage(eventType) {
  const contentMap = {
    soft_bounce:
      "Verification email soft bounced. There might be a temporary issue with the recipient's inbox. Please check the email address you entered or try again later.",
    hard_bounce:
      'Verification email hard bounced. Please check the email address you entered and correct it.',
    error:
      'An error occurred while sending the verification email. Please try again later or contact an administrator.',
    deferred:
      'Verification email delivery is temporarily deferred. Please try again later.',
    blocked:
      'Verification email was blocked. Please check the email address or contact support.',
    invalid_email:
      'Invalid email address. Please check the email address you entered and correct it.',
  }
  return (
    contentMap[eventType] ||
    'An unexpected error occurred with the email delivery.'
  )
}

module.exports = handleBrevoEvent
