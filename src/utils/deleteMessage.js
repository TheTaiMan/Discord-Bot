/**
 * Deletes a message using either a message ID and channel/interaction, or a message object directly
 * @param {Object} options
 * @param {string} [options.messageId] - The ID of the message to delete
 * @param {Object} [options.message] - Direct message object to delete
 * @param {Object} [options.interaction] - Interaction object to get the channel from
 * @param {Object} [options.channel] - Direct channel object to fetch message from
 * @returns {Promise<boolean>} True if deletion was successful, false otherwise
 */
async function deleteMessage({ messageId, message, interaction, channel }) {
  try {
    // If direct message object is provided, delete it
    if (message) {
      await message.delete()
      return true
    }

    // If no message ID, nothing to delete
    if (!messageId) {
      return false
    }

    // Get channel from either interaction or direct channel object
    const targetChannel = channel || interaction?.channel
    if (!targetChannel) {
      console.error('No channel available to delete message')
      return false
    }

    // Fetch and delete the message
    const targetMessage = await targetChannel.messages.fetch(messageId)
    await targetMessage.delete()
    return true
  } catch (error) {
    console.error('Error deleting message:', error)
    return false
  }
}

module.exports = { deleteMessage }


/* 

- Using message ID and interaction
await deleteMessage({ 
  messageId: userData.originalButtonMessageId, 
  interaction 
})

- Using message ID and channel
await deleteMessage({ 
  messageId: userData.originalButtonMessageId, 
  channel: someChannel 
})

- Using direct message object
await deleteMessage({ 
  message: someMessage 
})

*/