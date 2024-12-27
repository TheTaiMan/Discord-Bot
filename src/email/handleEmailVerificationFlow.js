const createEditEmailButton = require('../components/createEditEmailButton')
const createSendCodeButton = require('../components/createSendCodeButton')
const UserManager = require('../UserManager')
const { ActionRowBuilder } = require('discord.js')

const handleEmailVerificationFlow = async (interaction, userData, response) => {
  userData.setEmailForVerification(response) // Store for verification
  UserManager.setVerificationInteraction(interaction.user.id, interaction) // Store interaction
  UserManager.printAllUserData() // ! Print all user data

  const editButton = createEditEmailButton()
  const sendCodeButton = createSendCodeButton()

  const row = new ActionRowBuilder().addComponents(editButton, sendCodeButton)

  await interaction.channel.send({
    content: `Your email is: ${response}. Please confirm or edit it.`,
    components: [row],
  })
}

module.exports = handleEmailVerificationFlow
