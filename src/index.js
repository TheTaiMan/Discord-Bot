const { Client, GatewayIntentBits } = require('discord.js')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

// Import the webhook server
require('./webhook') // This will start the webhook server

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

// Start the bot
client.login(process.env.DISCORD_TOKEN)
