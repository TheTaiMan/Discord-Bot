const UserManager = require('../UserManager')
const { sendVerificationEmail } = require('../email/brevo')

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

  UserManager.setVerificationInteraction(userId, interaction) // Store the interaction using userId

  const email = userData.responses.email
  const verificationCode = generateVerificationCode()

  userData.verificationCode = verificationCode
  userData.verificationStatus = 'pending_send'
  userData.emailForVerification = email

  try {
    await sendVerificationEmail(email, verificationCode)
  } catch (error) {
    console.error('Error sending verification email:', error)
    await interaction.editReply({
      content:
        'Failed to initiate sending the verification code. Please try again later.',
      components: [],
    })
    userData.verificationStatus = 'error'
  }
}

module.exports = handleSendCode
