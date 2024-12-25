const UserManager = require('../UserManager')
const { sendVerificationEmail } = require('../email/brevo')
// Function to generate a random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
}

const handleSendCode = async (interaction) => {
  await interaction.reply({
    content: 'Attempting to send verification code...', // Updated initial message
    ephemeral: true,
  })

  const userId = interaction.user.id
  const userData = UserManager.getUser(userId)

  if (!userData || !userData.responses.email) {
    return interaction.followUp({
      content: 'Email address not found. Please enter your email first.',
      ephemeral: true,
    })
  }

  const email = userData.responses.email
  const verificationCode = generateVerificationCode()

  // Store the verification code in userData
  userData.verificationCode = verificationCode
  userData.verificationStatus = 'pending_send' // New status: pending sending
  userData.emailForVerification = email

  try {
    const brevoResponse = await sendVerificationEmail(email, verificationCode)
    // You might want to store the message-id from brevoResponse if needed for more specific tracking
    console.log('Brevo send response:', brevoResponse)
    // No success/failure UI update here. Webhook will handle it.
  } catch (error) {
    console.error('Error sending verification email:', error)
    // If there's an immediate error with the Brevo API, inform the user
    await interaction.editReply({
      content:
        'Failed to initiate sending the verification code. Please try again later.',
      components: [], // Remove buttons as the process failed
    })
    userData.verificationStatus = 'error'
  }
}

module.exports = handleSendCode
