const { ActionRowBuilder } = require('discord.js')

const removeSkipButton = async (message) => {
  if (!message || !message.components || message.components.length === 0) {
    return
  }

  try {
    const updatedComponents = message.components
      .map((row) => {
        const updatedButtons = row.components.filter(
          (component) => !component.customId.startsWith('skip-')
        )

        return updatedButtons.length > 0
          ? new ActionRowBuilder().addComponents(updatedButtons)
          : null
      })
      .filter((row) => row !== null)

    await message.edit({
      components: updatedComponents.length > 0 ? updatedComponents : [],
    })
  } catch (error) {
    console.error('Error removing skip button:', error)
  }
}

module.exports = removeSkipButton
