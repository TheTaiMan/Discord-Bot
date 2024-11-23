const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js')

function createNameModal() {
  const modal = new ModalBuilder()
    .setCustomId('name-modal')
    .setTitle('Enter Your Name')

  const nameInput = new TextInputBuilder()
    .setCustomId('name-input')
    .setLabel('What is your full name?')
    .setStyle(TextInputStyle.Short)
    .setMinLength(2)
    .setMaxLength(50)
    .setPlaceholder('John Doe')
    .setRequired(true)

  const firstActionRow = new ActionRowBuilder().addComponents(nameInput)
  modal.addComponents(firstActionRow)
  return modal
}

function createEmailModal() {
  const modal = new ModalBuilder()
    .setCustomId('email-modal')
    .setTitle('Enter Your Email')

  const emailInput = new TextInputBuilder()
    .setCustomId('email-input')
    .setLabel('What is your email address?')
    .setStyle(TextInputStyle.Short)
    .setMinLength(5)
    .setMaxLength(100)
    .setPlaceholder('john@example.com')
    .setRequired(true)

  const firstActionRow = new ActionRowBuilder().addComponents(emailInput)
  modal.addComponents(firstActionRow)
  return modal
}

module.exports = {
  createNameModal,
  createEmailModal,
}
