const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

function createSkipButton(question) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`skip-${question.id}`)
      .setLabel('Skip')
      .setStyle(ButtonStyle.Danger)
  )
}

module.exports = createSkipButton
