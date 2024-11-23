const { Client, GatewayIntentBits } = require('discord.js')
const fs = require('fs')
const path = require('path')
const config = require('./config')

const client = new Client({
  intents: config.INTENTS.map((intent) => GatewayIntentBits[intent]),
})

// Load events
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file))
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(config.TOKEN)
