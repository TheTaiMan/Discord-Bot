const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js')

function createSelectMenu(question) {
  const select = new StringSelectMenuBuilder()
    .setCustomId(`${question.id}-select`)
    .setPlaceholder('Make a selection')
    .addOptions(
      question.options.map((opt) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(opt.label)
          .setValue(opt.value)
      )
    )

  if (question.type === 'multiSelect') {
    select
      .setMinValues(question.minValues || 1)
      .setMaxValues(question.maxValues || question.options.length)
  }

  return new ActionRowBuilder().addComponents(select)
}

module.exports = createSelectMenu
