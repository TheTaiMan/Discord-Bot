// src/utils/disableButton.js
const { ActionRowBuilder, ButtonBuilder } = require('discord.js')

async function disableButton(message, buttonId) {
  try {
    if (!message) return

    // Get the existing components
    const existingRows = message.components

    // Create new rows with disabled button
    const newRows = existingRows.map((row) => {
      const newRow = new ActionRowBuilder()

      // Map each component in the row
      const components = row.components.map((component) => {
        // Create a new ButtonBuilder from the existing button data
        const newButton = ButtonBuilder.from(component)

        // Disable only the specified button
        if (component.customId === buttonId) {
          newButton.setDisabled(true)
        }

        return newButton
      })

      return newRow.addComponents(components)
    })

    // Update the message with disabled button
    await message.edit({ components: newRows })
  } catch (error) {
    console.error('Error disabling button:', error)
  }
}

module.exports = { disableButton }
