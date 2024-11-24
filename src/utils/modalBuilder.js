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

const questions = [
  {
    id: 'name',
    question: 'What is your full name?',
    buttonLabel: 'Enter Full Name',
    modalTitle: 'Full Name',
    modalLabel: 'What is your full name?',
    placeholder: 'John Joe',
    inputStyle: 'Short',
  },
  {
    id: 'email',
    question: 'What is your student email address?',
    buttonLabel: 'Enter Email',
    modalTitle: 'Student Email',
    modalLabel: 'What is your student email address?',
    placeholder: 'student@university.edu',
    inputStyle: 'Short',
  },
  // Add more questions following the same format
]

// inputStyle: 'Short' or 'Paragraph'

module.exports = {
  createQuestionModal,
  createQuestionButton,
  questions,
  ButtonStyle,
}
