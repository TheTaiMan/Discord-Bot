const { Client, GatewayIntentBits } = require('discord.js')
const express = require('express')
const path = require('path')
const UserManager = require('./UserManager')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

// Create Discord client with specified intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

// Event Listeners
const { execute: handleReady } = require('./events/ready')
const { execute: handleInteraction } = require('./events/interactionCreate')
const { execute: handleMessage } = require('./events/messageCreate')

// Register event handlers
client.on('ready', handleReady)
client.on('interactionCreate', handleInteraction)
client.on('messageCreate', handleMessage)

// Create Express server for webhooks
const app = express()
app.use(express.json())

// Webhook endpoint for Brevo
app.post('/brevo-webhook', async (req, res) => {
  console.log('=== BREVO WEBHOOK RECEIVED ===')
  console.log('Full webhook data:', JSON.stringify(req.body, null, 2))
  
  const { event, email, reason, date, subject, message_id } = req.body
  
  console.log(`📧 Email Event: ${event}`)
  console.log(`📍 Email Address: ${email}`)
  console.log(`📅 Date: ${date || 'Not provided'}`)
  console.log(`📋 Subject: ${subject || 'Not provided'}`)
  console.log(`🆔 Message ID: ${message_id || 'Not provided'}`)
  
  // Handle different event types
  if (['hard_bounce', 'invalid_email', 'blocked', 'error'].includes(event)) {
    console.log(`❌ EMAIL DELIVERY FAILED`)
    console.log(`📝 Reason: ${reason || 'No reason provided'}`)
    
    // Find the Discord user associated with this email
    const userId = UserManager.getUserIdByEmail(email)
    if (userId) {
      console.log(`🎯 Found Discord user: ${userId}`)
      await notifyUserOfEmailFailure(userId, email, event, reason)
      // Clean up the mapping after notification
      UserManager.removeEmailMapping(email)
    } else {
      console.log(`⚠️ No Discord user found for email: ${email}`)
    }
  } else if (event === 'delivered') {
    console.log(`✅ EMAIL DELIVERED SUCCESSFULLY`)
    // Clean up mapping for successful deliveries
    const userId = UserManager.getUserIdByEmail(email)
    if (userId) {
      UserManager.removeEmailMapping(email)
      console.log(`🧹 Cleaned up email mapping for successful delivery`)
    }
  } else if (event === 'opened') {
    console.log(`👁️ EMAIL OPENED`)
  } else if (event === 'clicked') {
    console.log(`🖱️ EMAIL LINK CLICKED`)
  } else {
    console.log(`ℹ️ OTHER EVENT: ${event}`)
  }
  
  console.log('================================\n')
  
  res.status(200).send('OK')
})

// Function to notify Discord user of email failure
async function notifyUserOfEmailFailure(userId, email, eventType, reason) {
  try {
    // Find the user's onboarding channel
    const guilds = client.guilds.cache
    let onboardingChannel = null
    
    for (const guild of guilds.values()) {
      const channel = guild.channels.cache.find(
        (ch) => ch.name === `onboarding-${userId}`
      )
      if (channel) {
        onboardingChannel = channel
        break
      }
    }
    
    if (!onboardingChannel) {
      console.log(`❌ No onboarding channel found for user ${userId}`)
      return
    }
    
    let errorMessage = `❌ **Email Delivery Failed**\n\nYour verification email to **${email}** could not be delivered.\n\n`
    
    switch (eventType) {
      case 'hard_bounce':
        errorMessage += `**Reason:** Hard bounce - ${reason || 'Email address does not exist or is invalid'}\n\n`
        errorMessage += `**What to do:** Please check your email address for typos and try again with a different email address.`
        break
      case 'invalid_email':
        errorMessage += `**Reason:** Invalid email format - ${reason || 'Email address format is incorrect'}\n\n`
        errorMessage += `**What to do:** Please check your email address format and try again.`
        break
      case 'blocked':
        errorMessage += `**Reason:** Blocked - ${reason || 'Email was blocked by the recipient server'}\n\n`
        errorMessage += `**What to do:** Your email provider may be blocking our emails. Try using a different email address.`
        break
      case 'error':
        errorMessage += `**Reason:** Delivery error - ${reason || 'Unknown error occurred'}\n\n`
        errorMessage += `**What to do:** This may be a temporary issue. Please wait a moment and try again.`
        break
      default:
        errorMessage += `**Reason:** ${eventType} - ${reason || 'No additional details'}\n\n`
        errorMessage += `**What to do:** Please try again or contact support if the issue persists.`
    }
    
    // Get the user data and delete the verification prompt message
    const UserManager = require('./UserManager')
    const userData = UserManager.getUser(userId)
    
    if (userData && userData.verificationPromptMessage) {
      try {
        await userData.verificationPromptMessage.delete()
        console.log(`🗑️ Deleted verification prompt message`)
      } catch (error) {
        console.error('Failed to delete verification prompt message:', error)
      }
    }
    
    // Get the email question for the "Enter Email" button
    const createModalButton = require('./components/createModalButton')
    const { questions } = require('./questions')
    const emailQuestion = questions.find(q => q.id === 'email')
    const enterEmailButton = createModalButton(emailQuestion, true)
    
    const errorMessageObj = await onboardingChannel.send({
      content: errorMessage,
      components: [enterEmailButton],
    })
    
    // Update the stored message ID
    if (userData) {
      userData.setOriginalButtonMessageId(errorMessageObj.id)
    }
    
    console.log(`✅ Notified user ${userId} about email failure in their onboarding channel`)
  } catch (error) {
    console.error(`❌ Failed to notify user ${userId} about email failure:`, error)
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Bot is running!')
})

// Start Express server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`)
})

// Start the bot
client.login(process.env.DISCORD_TOKEN)
