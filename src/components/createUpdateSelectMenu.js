const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js')

function createUpdateSelectMenu(question) {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`${question.id}-update-select`)
    .setPlaceholder(`Update your ${question.id.toLowerCase()}`)
    .addOptions(
      question.options.map((opt) => ({
        label: opt.label,
        value: opt.value,
      }))
    )

  if (question.type === 'multiSelect') {
    selectMenu
      .setMinValues(question.minValues || 1)
      .setMaxValues(question.maxValues || question.options.length)
  }

  return new ActionRowBuilder().addComponents(selectMenu)
}

module.exports = createUpdateSelectMenu
