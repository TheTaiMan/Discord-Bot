const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

// In your config.js
module.exports = {
  TOKEN: process.env.DISCORD_TOKEN,
  INTENTS: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
}
