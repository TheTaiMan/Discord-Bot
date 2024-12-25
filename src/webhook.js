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
  const interaction = UserManager.getVerificationInteraction(userData.userId) // Get the stored interaction using userId

  if (!interaction) {
    console.log('Original interaction not found to update.')
    return res.sendStatus(200)
  }

  try {
    switch (eventType) {
      case 'request':
        await interaction.editReply({
          content: 'Verification email sent.',
          components: [],
        })
        userData.verificationStatus = 'sent'
        break
      case 'delivered':
        const enterCodeButton = new ButtonBuilder()
          .setCustomId('enter-verification-code')
          .setLabel('Enter Verification Code')
          .setStyle(ButtonStyle.Primary)
        const row = new ActionRowBuilder().addComponents(enterCodeButton)
        await interaction.editReply({
          content: 'Verification email delivered! Ready to verify your email?',
          components: [row],
        })
        userData.verificationStatus = 'delivered'
        break
      case 'soft_bounce':
        await interaction.editReply({
          content: `Verification email soft bounced. There might be a temporary issue with the recipient's inbox.`,
          components: [],
        })
        userData.verificationStatus = 'soft_bounce'
        break
      case 'hard_bounce':
        await interaction.editReply({
          content: `Verification email hard bounced. Please check the email address you entered.`,
          components: [],
        })
        userData.verificationStatus = 'hard_bounce'
        break
      case 'error':
        await interaction.editReply({
          content: `An error occurred while sending the verification email.`,
          components: [],
        })
        userData.verificationStatus = 'brevo_error'
        break
      case 'deferred':
        await interaction.editReply({
          content: `Verification email delivery is temporarily deferred.`,
          components: [],
        })
        userData.verificationStatus = 'deferred'
        break
      case 'blocked':
        await interaction.editReply({
          content: `Verification email was blocked.`,
          components: [],
        })
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
