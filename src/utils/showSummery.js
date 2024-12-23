const { questions } = require('../questions')
const createUpdateComponents = require('../components/createUpdateComponents')
const createSubmitButton = require('../components/createSubmitButton')
const formatResponseSummary = require('./formatResponseSummary')

const showSummary = async (channel, userData) => {
  const responsesSummary = formatResponseSummary(userData.responses)

  // Filter questions based on the 'update' property
  const updateQuestions = questions.filter((question) => question.update)

  const updateComponents = await createUpdateComponents(updateQuestions)
  const submitRow = createSubmitButton()

  const components = [...updateComponents, submitRow].slice(0, 5)

  try {
    const message = await channel.send({
      content: `Here's your information:\n${responsesSummary}\n\nWould you like to update anything?`,
      components,
    })
    console.log('Summary message sent:', message.id)
  } catch (error) {
    console.error('Error sending summary message:', error)
  }
}

module.exports = showSummary
