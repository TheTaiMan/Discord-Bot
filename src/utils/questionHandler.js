const { ButtonStyle } = require('./modalBuilder')
const UserManager = require('./UserManager')
const { questions } = require('../questions')
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
} = require('discord.js')

async function handleSelectMenuInteraction(interaction) {
  // Remove both '-select' and '-update' from the ID to get the base questionId
  const questionId = interaction.customId
    .replace(/-select$/, '')
    .replace(/-update$/, '')
  const values = interaction.values
  const question = questions.find((q) => q.id === questionId)

  const userData = UserManager.getUser(interaction.user.id)
  if (!userData || !question) return

  userData.updateResponse(questionId, values, question.type)

  const responseText = Array.isArray(values)
    ? values
        .map((v) => question.options.find((opt) => opt.value === v).label)
        .join(', ')
    : question.options.find((opt) => opt.value === values).label

  await interaction.reply({
    content: `Your ${questionId} has been ${
      userData.isNewResponse ? 'recorded' : 'updated'
    } to: "${responseText}"`,
    ephemeral: true,
  })

  const channel = await interaction.client.channels.fetch(userData.channelId)

  if (userData.hasUpdatedResponse && userData.isComplete()) {
    await showSummary(channel, userData)
  } else if (!userData.hasUpdatedResponse) {
    await sendNextQuestion(channel, userData)
  }
}

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

async function showSummary(channel, userData) {
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

module.exports = {
  sendNextQuestion,
  handleSelectMenuInteraction,
  showSummary,
}
