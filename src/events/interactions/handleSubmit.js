const UserManager = require('../../utils/UserManager')

const handleSubmit = async (interaction) => {
  const userData = UserManager.getUser(interaction.user.id)
  if (userData) {
    await interaction.update({
      content:
        'Form submitted successfully! Your responses are being reviewed.',
      components: [],
    })
    // ! Prints the user data
    UserManager.printUserData(interaction.user.id)

    UserManager.removeUser(interaction.user.id)
  }
}

module.exports = handleSubmit
