const { ActionRowBuilder } = require('discord.js')

async function removeSkipButton(message) {
  if (message && message.components && message.components.length > 0) {
    const updatedComponents = message.components[0].components.filter(
      (component) => !component.customId.startsWith('skip-')
    )

    if (updatedComponents.length < message.components[0].components.length) {
      // Only edit if a skip button was actually removed
      if (updatedComponents.length > 0) {
        await message.edit({
          components: [
            new ActionRowBuilder().addComponents(...updatedComponents),
          ],
        })
      } else {
        await message.edit({ components: [] })
      }
    }
  }
}

module.exports = removeSkipButton
