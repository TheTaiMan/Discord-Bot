const UserManager = require('../UserManager')
const sendNextQuestion = require('../utils/sendNextQuestion')

const handleVerifyCode = async (interaction) => {
  const userId = interaction.user.id
  const userData = UserManager.getUser(userId)
  const enteredCode = interaction.fields.getTextInputValue(
    'verification-code-input'
  )

  if (!userData || !userData.verificationCode) {
    return interaction.reply({
      content: 'No verification code was requested.',
      ephemeral: true,
    })
  }

  if (userData.verificationCode === enteredCode) {
    userData.isVerified = true // Mark user as verified
    await interaction.reply({
      content: 'Verification successful!',
      ephemeral: true,
    })

    const channel = await interaction.client.channels.fetch(userData.channelId)
    await sendNextQuestion(channel, userData)
  } else {
    await interaction.reply({
      content: 'Verification failed. Please enter the correct code.',
      ephemeral: true,
    })
  }
}

module.exports = handleVerifyCode
