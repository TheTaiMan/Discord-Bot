const { questions } = require('../questions')
const createUpdateComponents = require('../components/createUpdateComponents')
const createSubmitButton = require('../components/createSubmitButton')
const formatResponseSummary = require('./formatResponseSummary')

const showSummary = async (channel, userData) => {
  // Delete previous summary message if it exists
  if (userData.summaryMessageId) {
    try {
      const oldSummaryMessage = await channel.messages.fetch(
        userData.summaryMessageId
      )
      await oldSummaryMessage.delete()
    } catch (error) {
      console.error('Error deleting previous summary message:', error)
    }
    // Clear the old message ID regardless of deletion success
    userData.summaryMessageId = null
  }

  const responsesSummary = formatResponseSummary(userData.responses)
  const updateQuestions = questions.filter((question) => question.update)
  const updateComponents = await createUpdateComponents(updateQuestions)
  const submitRow = createSubmitButton()

  // Combine components while respecting Discord's 5-component limit
  const components = [...updateComponents, submitRow].slice(0, 5)

  try {
    const message = await channel.send({
      content: `Here's your information:\n${responsesSummary}\n\nWould you like to update anything?`,
      components,
    })

    // Store the new summary message ID
    userData.summaryMessageId = message.id
    // console.log('New summary message sent with ID:', message.id)
  } catch (error) {
    console.error('Error sending summary message:', error)
  }
}

module.exports = showSummary
