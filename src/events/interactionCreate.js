const handleOnboarding = require('./interactions/handleOnboarding')
const handleModal = require('./interactions/handleModal')
const handleSubmit = require('./interactions/handleSubmit')
const handleSkipButton = require('./interactions/handleSkipButton')
const handleModalSubmission = require('./interactions/handleModalSubmission')

const handleSelectMenu = require('./interactions/handleSelectMenu')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handling Button Interactions
    if (interaction.isButton()) {
      if (interaction.customId === 'submit-form') {
        await handleSubmit(interaction)
      } else if (interaction.customId === 'start-onboarding') {
        await handleOnboarding(interaction)
      } else if (interaction.customId.startsWith('skip-')) {
        await handleSkipButton(interaction)
      } else if (interaction.customId.endsWith('-question')) {
        await handleModal(interaction)
      }
    }

    // Handling model submit button
    if (interaction.isModalSubmit()) {
      await handleModalSubmission(interaction)
    }

    // Handling submit button for the user data
    if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction)
    }
  },
}
