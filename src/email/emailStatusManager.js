const STATUS_MESSAGES = {
  request: 'Verification code sent, awaiting delivery...',
  delivered: 'Verification email delivered successfully!',
  soft_bounce:
    'Temporary delivery issue. Please try again or use a different email.',
  hard_bounce: 'Email delivery failed. Please check the address and try again.',
  invalid_email: 'Invalid email address. Please enter a valid email.',
  error: 'An error occurred while sending the verification email.',
  deferred: 'Email delivery delayed. Please wait a moment...',
  blocked: 'Email was blocked. Please try a different address.',
}

async function updateStatusMessage(channel, messageId, content) {
  try {
    if (!messageId) {
      const newMessage = await channel.send({
        content,
      })
      return newMessage.id
    }

    const message = await channel.messages.fetch(messageId)
    await message.edit({ content })
    return messageId
  } catch (error) {
    console.error('Failed to update status message:', error)
    const newMessage = await channel.send({
      content,
    })
    return newMessage.id
  }
}

module.exports = { STATUS_MESSAGES, updateStatusMessage }
