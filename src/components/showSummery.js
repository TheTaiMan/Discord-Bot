const { questions } = require('../questions')
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')

const showSummary = async (channel, userData) => {
  const responsesSummary = Object.entries(userData.responses)
    .map(
      ([key, value]) =>
        `**${key.charAt(0).toUpperCase() + key.slice(1)}**: ${value}`
    )
    .join('\n')

  const updateComponents = []

  // Add update buttons/select menus for each question
  for (const q of questions) {
    if (q.type === 'modal') {
      // Create button for modal questions
      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`${q.id}-question`)
          .setLabel(`Update ${q.modalTitle}`)
          .setStyle(ButtonStyle.Secondary)
      )
      updateComponents.push(buttonRow)
    } else {
      // Create select menu for select/multiSelect questions
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`${q.id}-update-select`)
        .setPlaceholder(`Update your ${q.id.toLowerCase()}`)
        .addOptions(
          q.options.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))
        )

      if (q.type === 'multiSelect') {
        selectMenu
          .setMinValues(q.minValues || 1)
          .setMaxValues(q.maxValues || q.options.length)
      }

      const selectRow = new ActionRowBuilder().addComponents(selectMenu)
      updateComponents.push(selectRow)
    }
  }

  // Add submit button as the last component
  const submitRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('submit-form')
      .setLabel('Submit Form')
      .setStyle(ButtonStyle.Success)
  )
  updateComponents.push(submitRow)

  try {
    const message = await channel.send({
      content: `Here's your information:\n${responsesSummary}\n\nWould you like to update anything?`,
      components: updateComponents.slice(0, 5), // Discord has a limit of 5 action rows per message
    })
    console.log('Summary message sent:', message.id)
  } catch (error) {
    console.error('Error sending summary message:', error)
  }
}

module.exports = showSummary
