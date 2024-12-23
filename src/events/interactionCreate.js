const handleOnboarding = require('../interactions/handleOnboarding')
const handleModal = require('../interactions/handleModal')
const handleSkipButton = require('../interactions/handleSkipButton')
const handleSubmit = require('../interactions/handleSubmit')

const handleModalSubmission = require('../interactions/handleModalSubmission')
const handleSelectMenu = require('../interactions/handleSelectMenu')

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalSubmission(interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    }
  },
}

async function handleButtonInteraction(interaction) {
  const { customId } = interaction;
  if (customId === 'start-onboarding') {
    await handleOnboarding(interaction);
  } else if (customId.endsWith('-question')) {
    await handleModal(interaction);
  } else if (customId.startsWith('skip-')) {
    await handleSkipButton(interaction);
  } else if (customId === 'submit-form') {
    await handleSubmit(interaction);
  }
}
