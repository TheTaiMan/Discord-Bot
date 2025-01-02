const createEditEmailButton = require('../components/createEditEmailButton')
const createSendCodeButton = require('../components/createSendCodeButton')
const UserManager = require('../UserManager')
const { verifyEmailAddress } = require('./verifyEmailAddress')
const { ActionRowBuilder } = require('discord.js')
const { deleteMessage } = require('../utils/deleteMessage')

const handleEmailVerificationFlow = async (interaction, userData, email) => {
  try {
    // Preliminary email verification
    await verifyEmailAddress(email)

    // If verification passes, proceed with the flow
    userData.setEmailForVerification(email)
    UserManager.printAllUserData()

    // Delete any existing email interaction messages
    if (userData.originalButtonMessageId) {
      await deleteMessage({
        messageId: userData.originalButtonMessageId,
        channel: interaction.channel,
      })
    }

    const editButton = createEditEmailButton()
    const sendCodeButton = createSendCodeButton()
    const row = new ActionRowBuilder().addComponents(editButton, sendCodeButton)

    const message = await interaction.reply({
      content: `Your email is: ${email}. Please confirm or edit it.`,
      components: [row],
      fetchReply: true,
    })

    // Store the message ID for later cleanup
    userData.setOriginalButtonMessageId(message.id)
  } catch (error) {
    // Handle validation errors
    await interaction.reply({
      content: error.message,
      ephemeral: true,
    })
  }
}

module.exports = handleEmailVerificationFlow
