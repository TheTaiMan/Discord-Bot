const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js')

function createModal(
  customId,
  title,
  label,
  placeholder,
  inputStyle,
  required,
  minLength = 1,
  maxLength = 100
) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title)

  const input = new TextInputBuilder()
    .setCustomId(`${customId}-input`)
    .setLabel(label)
    .setStyle(TextInputStyle[inputStyle])
    .setMinLength(minLength)
    .setMaxLength(maxLength)
    .setPlaceholder(placeholder)
    .setRequired(required)

  modal.addComponents(new ActionRowBuilder().addComponents(input))
  return modal
}

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

module.exports = {
  createModal,
  createSelectMenu, // Make sure this is exported
}
