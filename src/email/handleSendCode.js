const UserManager = require('../UserManager')
const { sendVerificationEmail } = require('./sendVerificationEmail')
const { disableButton } = require('../utils/disableButton')
const { cooldownButton } = require('../utils/cooldownButton')
const createVerificationPrompt = require('../components/createVerificationPrompt') // Import the function
const selfDestruct = require('../utils/selfDestruct')

const MAX_RESEND_ATTEMPTS = 5

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
      content: `You've exceeded the maximum number of resend attempts. This channel will self-destruct.`,
      ephemeral: true,
    })
    
    // Trigger self-destruction
    const channel = interaction.channel
    await selfDestruct(channel, userId)
    return
  }

  // Disable both the send code button and edit email button immediately
  if (interaction.message) {
    try {
      await disableButton(interaction.message, 'send-verification-code')
      await disableButton(interaction.message, 'edit-email')
      userData.sendCodeMessageId = interaction.message.id
    } catch (error) {
      console.error('Error disabling buttons:', error)
    }
  }

  const verificationCode = generateVerificationCode()

  try {
    await sendVerificationEmail(
      userData.emailForVerification,
      verificationCode,
      userData
    )
    userData.verificationCode = verificationCode
    userData.verificationStatus = 'pending'

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

    await interaction.editReply({
      content: `Verification code has been sent. Please enter it below.`,
      ephemeral: true,
    })

    // Delete previous verification prompt if it exists
    if (userData.verificationPromptMessage) {
      try {
        await userData.verificationPromptMessage.delete()
      } catch (error) {
        console.error('Error deleting previous verification prompt:', error)
        // Continue even if deletion fails
      }
    }

    // Immediately show the verification prompt and store the message
    userData.verificationPromptMessage = await createVerificationPrompt(
      interaction.channel
    )

    // Apply 40-second cooldown to the resend button
    if (userData.verificationPromptMessage) {
      await cooldownButton(userData.verificationPromptMessage, 'resend-verification-code', 40000)
    }
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
