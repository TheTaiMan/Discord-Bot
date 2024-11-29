const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

function createModalButton(question) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${question.id}-question`)
      .setLabel(question.buttonLabel)
      .setStyle(ButtonStyle.Primary)
  )
}

module.exports = createModalButton
