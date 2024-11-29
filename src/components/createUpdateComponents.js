const createModalButton = require('./createModalButton')
const createUpdateSelectMenu = require('./createUpdateSelectMenu')

const createUpdateComponents = (questions) => {
  return questions.map((question) => {
    if (question.type === 'modal') {
      return createModalButton(question, false)
    }
    return createUpdateSelectMenu(question)
  })
}

module.exports = createUpdateComponents
