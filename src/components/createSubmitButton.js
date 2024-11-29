const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

function createSubmitButton() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('submit-form')
      .setLabel('Submit Form')
      .setStyle(ButtonStyle.Success)
  )
}

module.exports = createSubmitButton
