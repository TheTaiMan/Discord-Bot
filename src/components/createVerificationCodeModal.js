// src/components/createVerificationCodeModal.js
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js')

const createVerificationCodeModal = () => {
  return new ModalBuilder()
    .setCustomId('verify-code-modal')
    .setTitle('Enter Verification Code')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('verification-code-input')
          .setLabel('Verification Code')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter the code')
          .setRequired(true)
      )
    )
}

module.exports = createVerificationCodeModal
