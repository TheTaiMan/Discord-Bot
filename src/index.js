const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const path = require('path')
const config = require('./config')

// Create a new Discord client instance
const client = new Client({
  intents: config.INTENTS.map((intent) => GatewayIntentBits[intent]),
})

// Load events
const eventsPath = path.join(__dirname, 'events') // Construct the path to the events directory
const eventFiles = fs // Read the files in the events directory
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js')) // Filter the files to only include those ending with '.js'

// Loop through the event files
for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file)) // Require the event file
  if (event.once) {
    // If the event should only be triggered once, register it with client.once()
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    // Otherwise, register it with client.on() to trigger it on every event (this is an event listener)
    client.on(event.name, (...args) => event.execute(...args))
  }
}

// Log in to Discord with your bot's token
client.login(config.TOKEN)
