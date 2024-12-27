const { ButtonBuilder, ButtonStyle } = require('discord.js')

function createSendCodeButton() {
  return new ButtonBuilder()
    .setCustomId('send-verification-code')
    .setLabel('Send Code')
    .setStyle(ButtonStyle.Primary)
}

module.exports = createSendCodeButton
