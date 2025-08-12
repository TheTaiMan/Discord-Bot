const createEditEmailButton = require('../components/createEditEmailButton')
const createSendCodeButton = require('../components/createSendCodeButton')
const createModalButton = require('../components/createModalButton')
const UserManager = require('../UserManager')
const { verifyEmailAddress } = require('./verifyEmailAddress')
const { questions } = require('../questions')
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
    }).then(reply => reply.fetch())

    // Store the message ID for later cleanup
    userData.setOriginalButtonMessageId(message.id)
  } catch (error) {
    // Send ephemeral error message - user can use the original email button that's still available
    await interaction.reply({
      content: `❌ **Email verification failed:** ${error.message}\n\nPlease try again with a different email address using the email button above.`,
      ephemeral: true,
    })
  }
}

module.exports = handleEmailVerificationFlow
