const { ActionRowBuilder } = require('discord.js')
const createModalButton = require('./createModalButton')
const createUpdateSelectMenu = require('./createUpdateSelectMenu')

const createUpdateComponents = (questions) => {
  return questions.map((question) => {
    const row = new ActionRowBuilder()

    if (question.type === 'modal') {
      const button = createModalButton(question, false)
      row.addComponents(button.components[0])
    } else {
      const selectMenu = createUpdateSelectMenu(question)
      row.addComponents(selectMenu.components[0])
    }

    return row
  })
}

module.exports = createUpdateComponents
