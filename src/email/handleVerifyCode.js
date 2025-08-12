const UserManager = require('../UserManager')
const sendNextQuestion = require('../utils/sendNextQuestion')
const { deleteMessage } = require('../utils/deleteMessage') // Import deleteMessage
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const selfDestruct = require('../utils/selfDestruct')
const { questions } = require('../questions')


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
    // Don't advance question - let user continue with current question

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
    
    // Store the current question before advancing
    const originalQuestion = userData.currentQuestion
    
    // Advance to next unanswered question since current question (email) is now answered
    while (userData.currentQuestion < questions.length) {
      const currentQuestion = questions[userData.currentQuestion]
      if (!currentQuestion) break
      
      // If current question is already answered, advance to next
      if (userData.responses.hasOwnProperty(currentQuestion.id)) {
        userData.currentQuestion++
      } else {
        break // Found unanswered question
      }
    }
    
    // Check if user is complete and should see summary, or continue with next unanswered question
    if (userData.isComplete()) {
      const showSummary = require('../utils/showSummery')
      await showSummary(channel, userData)
    } else {
      // Only send next question if we actually advanced to a new question
      // If we're still on the same question, it's already displayed
      if (userData.currentQuestion !== originalQuestion) {
        await sendNextQuestion(channel, userData)
      }
      // If currentQuestion === originalQuestion, the question is already shown, do nothing
    }
  } else {
    // Failed verification - increment attempt counter
    userData.incrementVerificationAttempts()

    console.log(
      userData.emailForVerification + ' User invalid verification code'
    )
    UserManager.printAllUserData()

    if (userData.hasExceededVerificationAttempts()) {
      // Exceeded maximum attempts - self destruct
      await interaction.reply({
        content: 'Maximum verification attempts exceeded. This channel will self-destruct.',
        flags: require('discord.js').MessageFlags.Ephemeral,
      })

      // Trigger self-destruction with user cleanup
      await selfDestruct(interaction.channel, userId)
    } else {
      // Still has attempts remaining
      const remainingAttempts = 5 - userData.verificationAttempts

      await interaction.reply({
        content: `Incorrect code. You have ${remainingAttempts} attempt${
          remainingAttempts === 1 ? '' : 's'
        } remaining.`,
        flags: require('discord.js').MessageFlags.Ephemeral,
      })
    }
  }
}

module.exports = handleVerifyCode
