// src/interactions/handleSendCode.js

const UserManager = require('../UserManager')
const { sendVerificationEmail } = require('../email/brevo')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

// Function to generate a random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
}

const handleSendCode = async (interaction) => {
  await interaction.reply({
    content: 'Sending verification code...',
    ephemeral: true,
  }) // Initial reply

  const userId = interaction.user.id
  const userData = UserManager.getUser(userId)

  if (!userData || !userData.responses.email) {
    return interaction.followUp({
      // Use followUp for subsequent messages after initial reply
      content: 'Email address not found. Please enter your email first.',
      ephemeral: true,
    })
  }

  const email = userData.responses.email
  const verificationCode = generateVerificationCode()

  // Store the verification code in userData
  userData.verificationCode = verificationCode
  userData.verificationStatus = 'pending' // Add verification status

  const isSent = await sendVerificationEmail(email, verificationCode)

  if (isSent) {
    userData.verificationStatus = 'sent'
    const enterCodeButton = new ButtonBuilder()
      .setCustomId('enter-verification-code')
      .setLabel('Enter Verification Code')
      .setStyle(ButtonStyle.Primary)

    const resendCodeButton = new ButtonBuilder()
      .setCustomId('resend-verification-code')
      .setLabel('Resend Code')
      .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder().addComponents(
      enterCodeButton,
      resendCodeButton
    )

    await interaction.editReply({
      // Edit the initial "Sending..." message
      content: 'Verification code sent! Please check your email.',
      components: [row],
      ephemeral: true, // Keep it ephemeral
    })
  } else {
    userData.verificationStatus = 'error'
    const resendCodeButton = new ButtonBuilder()
      .setCustomId('resend-verification-code')
      .setLabel('Resend Code')
      .setStyle(ButtonStyle.Danger)

    await interaction.editReply({
      // Edit the initial "Sending..." message
      content:
        'Error sending verification code. Please try again or contact a mod.',
      components: [new ActionRowBuilder().addComponents(resendCodeButton)],
      ephemeral: true, // Keep it ephemeral
    })
  }
}

module.exports = handleSendCode
