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
      const messages = await dmChannel.messages.fetch({ limit: 50 }) // Adjust limit as needed
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
    await handleBrevoEvent(
      eventType,
      recipientEmail,
      userData,
      interaction,
      channel
    )
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
