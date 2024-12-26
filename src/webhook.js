const express = require('express')
const bodyParser = require('body-parser')
const UserManager = require('./UserManager')
const {
  Client,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js')

const app = express()
app.use(bodyParser.json())

const discordClient = new Client({ intents: [] })
discordClient.login(process.env.DISCORD_TOKEN)

app.post('/brevo-webhook', async (req, res) => {
  const brevoEventData = req.body
  console.log('Received Brevo webhook event:', brevoEventData)

  const eventType = brevoEventData.event
  const recipientEmail = brevoEventData.email

  const userDataArray = Array.from(UserManager.users.values()).filter(
    (userData) => userData.emailForVerification === recipientEmail
  )

  if (userDataArray.length === 0) {
    console.log(`No user found with verification email: ${recipientEmail}`)
    return res.sendStatus(200)
  }

  const userData = userDataArray[0]
  let interaction = UserManager.getVerificationInteraction(userData.userId)

  // Safeguard: Fetch the interaction again if it's initially not found
  if (!interaction) {
    try {
      const user = await discordClient.users.fetch(userData.userId)
      const dmChannel = await user.createDM()
      // Attempt to find the initial message (you might need a way to identify it, e.g., by content)
      const messages = await dmChannel.messages.fetch({ limit: 5 }) // Adjust limit as needed
      const initialMessage = messages.find(
        (msg) =>
          msg.author.id === discordClient.user.id &&
          msg.content === 'Attempting to send verification code...'
      )
      if (initialMessage) {
        // Recreate the interaction object (limited functionality)
        interaction = {
          isCommand: () => true, // Or appropriate check
          channelId: dmChannel.id,
          id: initialMessage.id,
          editReply: async (options) => initialMessage.edit(options),
        }
        console.log('Interaction refetched successfully.')
      } else {
        console.log('Initial message not found for refetch.')
      }
    } catch (error) {
      console.error('Error refetching interaction:', error)
    }
  }

  try {
    const channel = await discordClient.channels.fetch(userData.channelId)

    switch (eventType) {
      case 'request':
        if (interaction && interaction.editReply) {
          // Check if editReply is available
          await interaction.editReply({
            content: 'Verification email sent.',
            components: [],
          })
        } else {
          await channel.send({ content: 'Verification email sent.' }) // Fallback if no interaction
        }
        userData.verificationStatus = 'sent'
        break
      case 'delivered':
        // Send a new, non-ephemeral message for delivery confirmation
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
      case 'soft_bounce':
        if (interaction && interaction.editReply) {
          await interaction.editReply({
            content: `Verification email soft bounced. There might be a temporary issue with the recipient's inbox.`,
            components: [],
          })
        } else {
          await channel.send({
            content: `Verification email soft bounced. There might be a temporary issue with the recipient's inbox.`,
          })
        }
        userData.verificationStatus = 'soft_bounce'
        break
      case 'hard_bounce':
        if (interaction && interaction.editReply) {
          await interaction.editReply({
            content: `Verification email hard bounced. Please check the email address you entered.`,
            components: [],
          })
        } else {
          await channel.send({
            content: `Verification email hard bounced. Please check the email address you entered.`,
          })
        }
        userData.verificationStatus = 'hard_bounce'
        break
      case 'error':
        if (interaction && interaction.editReply) {
          await interaction.editReply({
            content: `An error occurred while sending the verification email.`,
            components: [],
          })
        } else {
          await channel.send({
            content: `An error occurred while sending the verification email.`,
          })
        }
        userData.verificationStatus = 'brevo_error'
        break
      case 'deferred':
        if (interaction && interaction.editReply) {
          await interaction.editReply({
            content: `Verification email delivery is temporarily deferred.`,
            components: [],
          })
        } else {
          await channel.send({
            content: `Verification email delivery is temporarily deferred.`,
          })
        }
        userData.verificationStatus = 'deferred'
        break
      case 'blocked':
        if (interaction && interaction.editReply) {
          await interaction.editReply({
            content: `Verification email was blocked.`,
            components: [],
          })
        } else {
          await channel.send({ content: `Verification email was blocked.` })
        }
        userData.verificationStatus = 'blocked'
        break
      default:
        console.log('Unknown Brevo event:', eventType)
    }

    res.sendStatus(200)
  } catch (error) {
    console.error('Error handling Brevo webhook:', error)
    res.sendStatus(500)
  }
})

const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3000
app.listen(WEBHOOK_PORT, () => {
  console.log(`Webhook server listening on port ${WEBHOOK_PORT}`)
})
