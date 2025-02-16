const createModal = require('../components/createModal')
const { questions } = require('../questions')

// Handles modal button press
const handleModal = async (interaction) => {
  const questionId = interaction.customId.replace('-question', '')
  const question = questions.find((q) => q.id === questionId)
  if (question) {
    const modal = createModal(
      `${questionId}-modal`,
      question.modalTitle,
      question.modalLabel,
      question.placeholder,
      question.inputStyle,
      question.required
    )
    await interaction.showModal(modal)
  }
}

module.exports = handleModal
