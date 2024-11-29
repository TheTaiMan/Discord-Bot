const UserManager = require('../UserManager')
const { addUserToNotion } = require('../notion/client')

const handleSubmit = async (interaction) => {
  const userData = UserManager.getUser(interaction.user.id)

  if (userData) {
    try {
      await interaction.update({
        content:
          'Form submitted successfully! Your responses are being reviewed.',
        components: [],
      })

      UserManager.printUserData(interaction.user.id)
      UserManager.removeUser(interaction.user.id)
    } catch (error) {
      console.error('Error submitting form:', error)
      await interaction.update({
        content:
          'There was an error submitting your form. Please try again or contact an admin.',
        components: [],
      })
    }
  }
}

module.exports = handleSubmit
