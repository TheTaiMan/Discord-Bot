const UserManager = require('../UserManager')
const { sendVerificationEmail } = require('./brevo')
const { verifyEmailAddress } = require('./verifyEmailAddress')

// Function to generate a random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
}

const handleSendCode = async (interaction) => {
  const userId = interaction.user.id
  const userData = UserManager.getUser(userId)

  if (!userData || !userData.emailForVerification) {
    return interaction.editReply({
      content: 'Email address not found. Please enter your email first.',
      ephemeral: true,
    })
  }

  if (userData.emailSendCount >= 3) {
    return interaction.editReply({
      content:
        'You have reached the maximum number of verification attempts. Please contact an administrator.',
      ephemeral: true,
    })
  }

  // Increment the send count
  userData.emailSendCount = (userData.emailSendCount || 0) + 1
  UserManager.printAllUserData() // Log user data after incrementing send count

  const email = userData.emailForVerification
  const verificationCode = generateVerificationCode()
  userData.verificationCode = verificationCode
  userData.verificationStatus = 'pending_send'

  // Store the interaction and the verificationMessageId
  UserManager.setVerificationInteraction(userId, interaction)
  userData.verificationMessageId = interaction.id // Using interaction ID as a temporary message ID

  try {
    // Verify the email address before sending the verification email
    verifyEmailAddress(email)
    await sendVerificationEmail(email, verificationCode)

    // Update the ephemeral message on successful send
    await interaction.editReply({
      content: 'Email sent successfully.',
      components: [], // Remove any buttons
    })
    userData.verificationStatus = 'request_sent'
    UserManager.printAllUserData() // Log user data after successful send

    // Delete the original message with the "Edit Email" and "Send Code" buttons
    if (interaction.message) {
      try {
        await interaction.message.delete()
      } catch (error) {
        console.error('Error deleting the email confirmation message:', error)
      }
    }
  } catch (error) {
    console.error('Error sending verification email:', error)

    const errorMessage =
      error.message ===
      'Invalid email address. Please use a university-affiliated email.'
        ? error.message
        : 'Failed to send verification code. Please try again later.'

    await interaction.editReply({
      content: errorMessage,
      components: [],
    })
    userData.verificationStatus = 'error'
    UserManager.printAllUserData() // Log user data after error
  }
}

module.exports = handleSendCode
