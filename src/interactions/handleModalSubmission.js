const showSummary = require('../utils/showSummery')
const sendNextQuestion = require('../utils/sendNextQuestion')
const UserManager = require('../UserManager')
const { questions } = require('../questions')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

async function handleEmailVerificationFlow(interaction, userData, response) {
  const channel = await interaction.client.channels.fetch(userData.channelId)
  const editButton = new ButtonBuilder()
    .setCustomId('edit-email')
    .setLabel('Edit Email')
    .setStyle(ButtonStyle.Secondary)

  const sendCodeButton = new ButtonBuilder()
    .setCustomId('send-verification-code')
    .setLabel('Send Code')
    .setStyle(ButtonStyle.Primary)

  const row = new ActionRowBuilder().addComponents(editButton, sendCodeButton)

  await interaction.channel.send({
    content: `Your email is: ${response}. Please confirm or edit it.`,
    components: [row],
  })
}

const handleModalSubmission = async (interaction) => {
  const questionId = interaction.customId.replace('-modal', '')
  const response = interaction.fields.getTextInputValue(
    `${questionId}-modal-input`
  )
  const question = questions.find((q) => q.id === questionId)

  const userData = UserManager.updateUserResponse(
    interaction.user.id,
    questionId,
    response,
    'modal'
  )
  if (!userData) return

  await interaction.reply({
    content: `Your ${questionId} has been ${
      userData.isNewResponse ? 'recorded' : 'updated'
    } to: "${response}"`,
    ephemeral: true,
  })

  const channel = await interaction.client.channels.fetch(userData.channelId)

  // Handle email verification flow
  if (question && question.id === 'email') {
    await handleEmailVerificationFlow(interaction, userData, response)
    return
  }

  if (userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

module.exports = handleModalSubmission
