const { questions } = require('../questions')
const showSummary = require('./showSummery')
const createSelectMenu = require('../components/createSelectMenu')
const createModalButton = require('../components/createModalButton')
const createSkipButton = require('../components/createSkipButton')

async function sendNextQuestion(channel, userData) {
  const nextQuestion = questions[userData.currentQuestion]

  if (userData.isComplete()) {
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
    case 'modal':
      components.push(createModalButton(question))
      break
    case 'select':
    case 'multiSelect':
      components.push(createSelectMenu(question))
      break
  }

  if (!question.required) {
    components.push(createSkipButton(question))
  }

  return components
}

module.exports = sendNextQuestion
