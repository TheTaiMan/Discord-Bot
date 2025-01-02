const UserManager = require('../UserManager')
const { sendVerificationEmail } = require('./sendVerificationEmail')
const { disableButton } = require('../utils/disableButton')

const MAX_RESEND_ATTEMPTS = 3

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const handleSendCode = async (interaction) => {
  await interaction.deferReply({ ephemeral: true })

  const userId = interaction.user.id
  const userData = UserManager.getUser(userId)

  if (!userData || !userData.emailForVerification) {
    await interaction.editReply({
      content: 'Email address not found. Please enter your email first.',
      ephemeral: true,
    })
    return
  }

  // Check resend attempts
  if (userData.verificationAttempts >= MAX_RESEND_ATTEMPTS) {
    await interaction.editReply({
      content: `You've exceeded the maximum number of resend attempts. Please try again later.`,
      ephemeral: true,
    })
    return
  }

  // Disable the send code button immediately
  if (interaction.message) {
    try {
      await disableButton(interaction.message, 'send-verification-code')
      userData.sendCodeMessageId = interaction.message.id
    } catch (error) {
      console.error('Error disabling send code button:', error)
    }
  }

  const verificationCode = generateVerificationCode()

  // Create/update status message
  const statusMessage = await interaction.channel.send({
    content: 'Attempting to send verification code...',
  })
  userData.setStatusMessageId(statusMessage.id)

  try {
    await sendVerificationEmail(
      userData.emailForVerification,
      verificationCode,
      userData
    )
    userData.verificationCode = verificationCode
    userData.verificationStatus = 'pending'
    userData.updateEmailStatus(null)

    // Delete the message containing the send code button
    if (userData.sendCodeMessageId) {
      try {
        const sendCodeMessage = await interaction.channel.messages.fetch(
          userData.sendCodeMessageId
        )
        await sendCodeMessage.delete()
        userData.sendCodeMessageId = null
      } catch (error) {
        console.error('Error deleting send code message:', error)
      }
    }

    const remainingAttempts =
      MAX_RESEND_ATTEMPTS - userData.verificationAttempts
    await interaction.editReply({
      content: `Verification code has been sent. You have ${remainingAttempts} resend ${
        remainingAttempts === 1 ? 'attempt' : 'attempts'
      } remaining.`,
      ephemeral: true,
    })
  } catch (error) {
    console.error('Error sending verification email:', error)
    userData.verificationStatus = 'error'

    await interaction.editReply({
      content: 'Failed to send verification code. Please try again later.',
      ephemeral: true,
    })
  }

  UserManager.printAllUserData()
}

module.exports = handleSendCode
