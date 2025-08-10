const { questions } = require('../questions')
const showSummary = require('./showSummery')
const createSelectMenu = require('../components/createSelectMenu')
const createModalButton = require('../components/createModalButton')
const createSkipButton = require('../components/createSkipButton')
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')

async function sendNextQuestion(channel, userData) {
  const nextQuestion = questions[userData.currentQuestion]

  if (!nextQuestion) {
    // If no more questions, show the summary
    return await showSummary(channel, userData)
  }

  const components = await buildQuestionComponents(nextQuestion)

  await channel.send({
    content: nextQuestion.question,
    components,
  })
}

async function buildQuestionComponents(question) {
  const components = []

  switch (question.type) {
    case 'confirmation':
      const continueButton = new ButtonBuilder()
        .setCustomId('continue-onboarding')
        .setLabel(question.continueLabel || 'Continue')
        .setStyle(ButtonStyle.Primary) // Blue button
      
      const endButton = new ButtonBuilder()
        .setCustomId('end-onboarding')
        .setLabel(question.endLabel || 'End Onboarding')
        .setStyle(ButtonStyle.Danger)
      
      components.push(new ActionRowBuilder().addComponents(continueButton, endButton))
      break
    case 'modal':
      // For modal buttons, put skip button in the same row
      const modalButtonRow = createModalButton(question)
      if (!question.required) {
        const skipButton = createSkipButton(question)
        modalButtonRow.addComponents(skipButton.components[0]) // Add skip button to same row
      }
      components.push(modalButtonRow)
      break
    case 'select':
    case 'multiSelect':
      // For select menus, put select menu first, then skip button in separate row
      components.push(createSelectMenu(question))
      if (!question.required) {
        components.push(createSkipButton(question))
      }
      break
  }

  return components
}

module.exports = sendNextQuestion
