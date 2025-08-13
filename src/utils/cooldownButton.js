// src/utils/cooldownButton.js
const { ActionRowBuilder, ButtonBuilder } = require('discord.js')

/**
 * Disables a button for a specified duration and then re-enables it
 * @param {Message} message - The Discord message containing the button
 * @param {string} buttonId - The custom ID of the button to cooldown
 * @param {number} durationMs - Duration in milliseconds to keep button disabled
 */
async function cooldownButton(message, buttonId, durationMs = 30000) {
  try {
    if (!message) return

    const durationSeconds = Math.ceil(durationMs / 1000)
    let remainingSeconds = durationSeconds

    // First, disable the button with countdown
    await updateButtonState(message, buttonId, true, remainingSeconds)

    // Update countdown every second
    const countdownInterval = setInterval(async () => {
      remainingSeconds--
      
      if (remainingSeconds > 0) {
        try {
          const updatedMessage = await message.fetch()
          await updateButtonState(updatedMessage, buttonId, true, remainingSeconds)
        } catch (error) {
          console.error('Error updating countdown:', error)
          clearInterval(countdownInterval)
        }
      } else {
        clearInterval(countdownInterval)
      }
    }, 1000)

    // Set timeout to re-enable the button
    setTimeout(async () => {
      try {
        clearInterval(countdownInterval)
        // Re-fetch the message to get the latest state
        const updatedMessage = await message.fetch()
        await updateButtonState(updatedMessage, buttonId, false)
      } catch (error) {
        console.error('Error re-enabling button after cooldown:', error)
      }
    }, durationMs)

  } catch (error) {
    console.error('Error setting button cooldown:', error)
  }
}

/**
 * Updates the disabled state of a specific button in a message
 * @param {Message} message - The Discord message containing the button
 * @param {string} buttonId - The custom ID of the button to update
 * @param {boolean} disabled - Whether to disable (true) or enable (false) the button
 * @param {number} remainingSeconds - Optional countdown seconds to display
 */
async function updateButtonState(message, buttonId, disabled, remainingSeconds = null) {
  try {
    if (!message) return

    // Get the existing components
    const existingRows = message.components

    // Create new rows with updated button state
    const newRows = existingRows.map((row) => {
      const newRow = new ActionRowBuilder()

      // Map each component in the row
      const components = row.components.map((component) => {
        // Create a new ButtonBuilder from the existing button data
        const newButton = ButtonBuilder.from(component)

        // Update the specified button's disabled state
        if (component.customId === buttonId) {
          newButton.setDisabled(disabled)
          
          // Optionally modify the label to show cooldown status
          if (disabled && buttonId === 'resend-verification-code') {
            if (remainingSeconds !== null) {
              newButton.setLabel(`Resend Code (${remainingSeconds}s)`)
            } else {
              newButton.setLabel('Resend Code (30s)')
            }
          } else if (!disabled && buttonId === 'resend-verification-code') {
            newButton.setLabel('Resend Code')
          }
        }

        return newButton
      })

      return newRow.addComponents(components)
    })

    // Update the message with new button state
    await message.edit({ components: newRows })
  } catch (error) {
    console.error('Error updating button state:', error)
  }
}

module.exports = { cooldownButton, updateButtonState }