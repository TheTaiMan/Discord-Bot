// webhook.js
const express = require('express')
const bodyParser = require('body-parser')
const UserManager = require('./UserManager') // Import UserManager
const { Client } = require('discord.js') // Import Discord.js Client

const app = express()
app.use(bodyParser.json())

// Assume your bot's token is in your .env file
const discordClient = new Client({ intents: [] })
discordClient.login(process.env.DISCORD_TOKEN)

app.post('/brevo-webhook', async (req, res) => {
  const brevoEventData = req.body
  console.log('Received Brevo webhook event:', brevoEventData)

  const eventType = brevoEventData.event
  const recipientEmail = brevoEventData.email

  // Find the user data based on the email
  const userDataArray = Array.from(UserManager.users.values()).filter(
    (userData) => userData.responses.email === recipientEmail
  )

  if (userDataArray.length === 0) {
    console.log(`No user found with email: ${recipientEmail}`)
    return res.sendStatus(200) // Still acknowledge the event
  }

  // Assuming only one user should have this email during onboarding
  const userData = userDataArray[0]
  const channelId = userData.channelId

  try {
    const channel = await discordClient.channels.fetch(channelId)

    switch (eventType) {
      case 'request':
        await channel.send('Verification email sent.')
        break
      case 'delivered':
        await channel.send('Verification email delivered!')
        // Proceed to prompt the user to enter the verification code
        const enterCodeButton = new ButtonBuilder()
          .setCustomId('enter-verification-code')
          .setLabel('Enter Verification Code')
          .setStyle(ButtonStyle.Primary)
        const row = new ActionRowBuilder().addComponents(enterCodeButton)
        await channel.send({
          content: 'Ready to verify your email?',
          components: [row],
        })
        break
      case 'soft_bounce':
        await channel.send(
          `Verification email soft bounced. There might be a temporary issue with the recipient's inbox.`
        )
        break
      case 'hard_bounce':
        await channel.send(
          `Verification email hard bounced. Please check the email address you entered.`
        )
        break
      case 'error':
        await channel.send(
          `An error occurred while sending the verification email.`
        )
        break
      case 'deferred':
        await channel.send(
          `Verification email delivery is temporarily deferred.`
        )
        break
      case 'blocked':
        await channel.send(`Verification email was blocked.`)
        break
      // Add more cases for other event types if needed
      default:
        console.log('Unknown Brevo event:', eventType)
    }

    res.sendStatus(200)
  } catch (error) {
    console.error('Error handling Brevo webhook:', error)
    res.sendStatus(500) // Indicate an error to Brevo
  }
})

const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3000
app.listen(WEBHOOK_PORT, () => {
  console.log(`Webhook server listening on port ${WEBHOOK_PORT}`)
})
