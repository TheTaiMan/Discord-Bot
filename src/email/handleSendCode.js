const UserManager = require('../UserManager')
const { sendVerificationEmail } = require('./sendVerificationEmail')
const { verifyEmailAddress } = require('./verifyEmailAddress')

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const handleSendCode = async (interaction) => {
  const userId = interaction.user.id
  const userData = UserManager.getUser(userId)

  if (!userData || !userData.emailForVerification) {
    await interaction.reply({
      content: 'Email address not found. Please enter your email first.',
      ephemeral: true,
    })
    return
  }

  // Delete the original message with the Send Code button
  try {
    if (userData.originalButtonMessageId) {
      const originalMessage = await interaction.channel.messages.fetch(
        userData.originalButtonMessageId
      )
      await originalMessage.delete()
    }
  } catch (error) {
    console.error('Error deleting original message:', error)
  }

  // Create a new status message
  const statusMessage = await interaction.channel.send({
    content: 'Attempting to send verification code...',
    ephemeral: true,
  })

  // Store the status message ID
  userData.setStatusMessageId(statusMessage.id)

  const email = userData.emailForVerification
  const verificationCode = generateVerificationCode()

  userData.verificationCode = verificationCode
  userData.verificationStatus = 'pending'

  UserManager.printAllUserData()
  try {
    verifyEmailAddress(email)
    await sendVerificationEmail(email, verificationCode, userData)
    // Don't update status here - let the webhook handle it
  } catch (error) {
    console.error('Error sending verification email:', error)

    const errorMessage =
      error.message ===
      'Invalid email address. Please use a university-affiliated email.'
        ? error.message
        : 'Failed to send verification code. Please try again later.'

    await statusMessage.edit({
      content: errorMessage,
    })

    userData.verificationStatus = 'error'
  }
}

module.exports = handleSendCode
