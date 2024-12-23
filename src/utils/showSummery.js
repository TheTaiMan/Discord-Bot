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

  // Delete the previous summary message if it exists
  if (userData.summaryMessageId) {
    try {
      const oldSummaryMessage = await channel.messages.fetch(
        userData.summaryMessageId
      )
      await oldSummaryMessage.delete()
      console.log(
        'Previous summary message deleted:',
        userData.summaryMessageId
      )
    } catch (error) {
      console.error('Error deleting previous summary message:', error)
      // It's okay if the message was already deleted or couldn't be found
    } finally {
      // Regardless of deletion success, clear the old ID
      userData.summaryMessageId = null
    }
  }

  try {
    const message = await channel.send({
      content: `Here's your information:\n${responsesSummary}\n\nWould you like to update anything?`,
      components,
    })
    console.log('Summary message sent:', message.id)
    // Store the ID of the new summary message
    userData.summaryMessageId = message.id
  } catch (error) {
    console.error('Error sending summary message:', error)
  }
}

module.exports = showSummary
