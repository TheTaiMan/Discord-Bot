const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js')

const createModal = (
  customId,
  title,
  label,
  placeholder,
  inputStyle,
  required,
  minLength = 1,
  maxLength = 100
) => {
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

module.exports = createModal
