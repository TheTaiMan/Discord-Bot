const createEditEmailButton = require('../components/createEditEmailButton')
const createSendCodeButton = require('../components/createSendCodeButton')
const UserManager = require('../UserManager')
const { ActionRowBuilder } = require('discord.js')

const handleEmailVerificationFlow = async (interaction, userData, response) => {
  userData.setEmailForVerification(response)
  UserManager.printAllUserData()
  const editButton = createEditEmailButton()
  const sendCodeButton = createSendCodeButton()
  const row = new ActionRowBuilder().addComponents(editButton, sendCodeButton)

  const message = await interaction.channel.send({
    content: `Your email is: ${response}. Please confirm or edit it.`,
    components: [row],
  })

  // Store the message ID for later cleanup
  userData.setOriginalButtonMessageId(message.id)
}

module.exports = handleEmailVerificationFlow
