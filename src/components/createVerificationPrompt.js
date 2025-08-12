const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')

const createVerificationPrompt = async (channel) => {
  const enterCodeButton = new ButtonBuilder()
    .setCustomId('enter-verification-code')
    .setLabel('Enter Verification Code')
    .setStyle(ButtonStyle.Primary)

  const resendButton = new ButtonBuilder()
    .setCustomId('resend-verification-code')
    .setLabel('Resend Code')
    .setStyle(ButtonStyle.Secondary)

  const row = new ActionRowBuilder().addComponents(
    enterCodeButton,
    resendButton
  )

  const message = await channel.send({
    content:
      `Ready to verify your email? Enter the verification code sent to your inbox.

📩 **Can\'t find the email?**
- ||Please check your junk mail or spam folder.||`,
    components: [row],
    ephemeral: false,
  })
  return message
}

module.exports = createVerificationPrompt
