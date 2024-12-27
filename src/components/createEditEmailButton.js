const { ButtonBuilder, ButtonStyle } = require('discord.js')

function createEditEmailButton() {
  return new ButtonBuilder()
    .setCustomId('edit-email')
    .setLabel('Edit Email')
    .setStyle(ButtonStyle.Secondary)
}

module.exports = createEditEmailButton
