const express = require('express')
const bodyParser = require('body-parser')
const UserManager = require('./UserManager')
const handleBrevoEvent = require('./email/handleBrevoEvent')
const { Client } = require('discord.js')

const app = express()
app.use(bodyParser.json())

const discordClient = new Client({ intents: [] })
discordClient.login(process.env.DISCORD_TOKEN)

app.post('/brevo-webhook', async (req, res) => {
  const brevoEventData = req.body
  console.log('Received Brevo webhook event:', brevoEventData)

  try {
    const eventType = brevoEventData.event
    const recipientEmail = brevoEventData.email

    // Find user with matching email
    const userDataArray = Array.from(UserManager.users.values()).filter(
      (userData) => userData.emailForVerification === recipientEmail
    )

    if (userDataArray.length === 0) {
      console.log(`No user found with verification email: ${recipientEmail}`)
      return res.sendStatus(200)
    }

    const userData = userDataArray[0]
    const channel = await discordClient.channels.fetch(userData.channelId)

    await handleBrevoEvent(eventType, recipientEmail, userData, channel)
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
