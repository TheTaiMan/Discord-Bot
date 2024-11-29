const { questions } = require('../questions')
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')
const showSummary = require('../components/showSummery')

async function sendNextQuestion(channel, userData) {
  const nextQuestion = questions[userData.currentQuestion]

  if (userData.isComplete()) {
    await showSummary(channel, userData)
  } else {
    let components = []

    switch (nextQuestion.type) {
      case 'modal':
        const buttonRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`${nextQuestion.id}-question`)
            .setLabel(nextQuestion.buttonLabel)
            .setStyle(ButtonStyle.Primary)
        )
        components.push(buttonRow)
        break
      case 'select':
      case 'multiSelect':
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`${nextQuestion.id}-select`)
          .setPlaceholder(nextQuestion.placeholder || 'Make a selection')
          .addOptions(
            nextQuestion.options.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))
          )

        if (nextQuestion.type === 'multiSelect') {
          selectMenu
            .setMinValues(nextQuestion.minValues || 1)
            .setMaxValues(nextQuestion.maxValues || nextQuestion.options.length)
        }

        const selectRow = new ActionRowBuilder().addComponents(selectMenu)
        components.push(selectRow)
        break
    }

    // Add skip button for non-required questions
    if (!nextQuestion.required) {
      const skipButton = new ButtonBuilder()
        .setCustomId(`skip-${nextQuestion.id}`)
        .setLabel('Skip')
        .setStyle(ButtonStyle.Danger)
      components.push(new ActionRowBuilder().addComponents(skipButton))
    }

    await channel.send({
      content: nextQuestion.question,
      components,
    })
  }
}

module.exports = {
  sendNextQuestion,
}
