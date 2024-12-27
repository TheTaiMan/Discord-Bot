const UserManager = require('../UserManager')
const { addUserToNotion } = require('../notion/client')
const selfDestruct = require('../utils/selfDestruct')

const handleSubmit = async (interaction) => {
  const userData = UserManager.getUser(interaction.user.id)

  if (userData) {
    try {
      const notionPageId = await addUserToNotion(userData, interaction.user)

      // Update interaction with success message
      await interaction.update({
        content:
          'Form submitted successfully! Your responses are being reviewed.',
        components: [],
      })

      UserManager.printUserData(interaction.user.id) // ! Print User Data
      UserManager.removeUser(interaction.user.id)

      // Self-destruct the current channel
      await selfDestruct(interaction.channel)
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
