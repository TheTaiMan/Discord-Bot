const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

function createModalButton(question, main = true) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${question.id}-question`)
      .setLabel(question.buttonLabel)
      .setStyle(main ? ButtonStyle.Primary : ButtonStyle.Secondary)
  )
}

module.exports = createModalButton
