const UserManager = require('../UserManager')
const sendNextQuestion = require('../utils/sendNextQuestion')
const { deleteMessage } = require('../utils/deleteMessage') // Import deleteMessage


const handleVerifyCode = async (interaction) => {
  const userId = interaction.user.id
  const userData = UserManager.getUser(userId)
  const enteredCode = interaction.fields.getTextInputValue(
    'verification-code-input'
  )

  if (!userData || !userData.verificationCode) {
    return await interaction.reply({
      content: 'No verification code was requested. Please request a new code.',
      ephemeral: true,
    })
  }

  if (userData.verificationCode === enteredCode) {
    // Successful verification
    userData.markEmailAsVerified(userData.emailForVerification)
    userData.isNewResponse = true
    userData.advanceToNextQuestion()

    await interaction.reply({
      content: 'Email verification successful!',
      ephemeral: true,
    })

    // Delete the verification prompt message
    if (userData.verificationPromptMessage) {
      await deleteMessage({ message: userData.verificationPromptMessage })
      userData.verificationPromptMessage = null // Clear the stored message
    }

    userData.resetEmailVerification()
    console.log(
      userData.emailForVerification + ' User reset email verification'
    )
    UserManager.printAllUserData()

    const channel = await interaction.client.channels.fetch(userData.channelId)
    await sendNextQuestion(channel, userData)
  } else {
    // Failed verification

    console.log(
      userData.emailForVerification + ' User invalid verification code'
    )
    UserManager.printAllUserData()

    if (userData.hasExceededVerificationAttempts()) {
      // Exceeded maximum attempts
      const editEmailButton = new ButtonBuilder()
        .setCustomId('edit-email')
        .setLabel('Enter New Email')
        .setStyle(ButtonStyle.Primary)

      const row = new ActionRowBuilder().addComponents(editEmailButton)

      await interaction.reply({
        content:
          'Maximum verification attempts exceeded. Please enter a different email address.',
        components: [row],
        ephemeral: true,
      })

      userData.resetEmailVerification()
    } else {
      // Still has attempts remaining
      const remainingAttempts = 3 - userData.verificationAttempts

      await interaction.reply({
        content: `Incorrect code. You have ${remainingAttempts} attempt${
          remainingAttempts === 1 ? '' : 's'
        } remaining.`,
        ephemeral: true,
      })
    }
  }
}

module.exports = handleVerifyCode
