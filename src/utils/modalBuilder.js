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
  minLength = 1,
  maxLength = 100
) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title)

  const input = new TextInputBuilder()
    .setCustomId(`${customId}-input`)
    .setLabel(label)
    .setStyle(TextInputStyle.Short)
    .setMinLength(minLength)
    .setMaxLength(maxLength)
    .setPlaceholder(placeholder)
    .setRequired(true)

  modal.addComponents(new ActionRowBuilder().addComponents(input))
  return modal
}

function createQuestionButton(customId, label) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Primary)
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
  },
  {
    id: 'email',
    question: 'What is your student email address?',
    buttonLabel: 'Enter Email',
    modalTitle: 'Student Email',
    modalLabel: 'What is your student email address?',
    placeholder: 'student@university.edu',
  },
  // Add more questions following the same format
]

module.exports = {
  createQuestionModal,
  createQuestionButton,
  questions,
}
