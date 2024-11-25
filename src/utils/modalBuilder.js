const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')

function createQuestionModal(
  customId,
  title,
  label,
  placeholder,
  inputStyle,
  minLength = 1,
  maxLength = 100
) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title)

  const input = new TextInputBuilder()
    .setCustomId(`${customId}-input`)
    .setLabel(label)
    .setStyle(TextInputStyle[inputStyle]) // Change this to TextInputStyle.Paragraph when inputting Paragraphs/sentences
    .setMinLength(minLength)
    .setMaxLength(maxLength)
    .setPlaceholder(placeholder)
    .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(input))
  return modal
}

function createQuestionButton(customId, label, buttonStyle) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(buttonStyle)
  )
}

// inputStyle: 'Short' or 'Paragraph'

module.exports = {
  createQuestionModal,
  createQuestionButton,
  ButtonStyle,
}
