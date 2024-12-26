const UserManager = require('../UserManager')
const { sendVerificationEmail } = require('./brevo')
const { verifyEmailAddress } = require('./verifyEmailAddress')

// Function to generate a random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
}

const handleSendCode = async (interaction) => {
  await interaction.reply({
    content: 'Attempting to send verification code...',
    ephemeral: true,
  })

  const userId = interaction.user.id
  const userData = UserManager.getUser(userId)

  if (!userData || !userData.responses.email) {
    return interaction.editReply({
      content: 'Email address not found. Please enter your email first.',
      components: [],
    })
  }

  UserManager.setVerificationInteraction(userId, interaction) // Store the interaction IMMEDIATELY

  const email = userData.responses.email
  const verificationCode = generateVerificationCode()

  userData.verificationCode = verificationCode
  userData.verificationStatus = 'pending_send'
  userData.emailForVerification = email

  try {
    // Verify the email address before sending the verification email
    verifyEmailAddress(email)
    await sendVerificationEmail(email, verificationCode)
    userData.verificationStatus = 'sent'
  } catch (error) {
    console.error('Error sending verification email:', error)

    // Simplified error message handling
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
  }
}

module.exports = handleSendCode
