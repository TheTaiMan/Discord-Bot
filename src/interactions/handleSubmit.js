const UserManager = require('../UserManager')
const { addUserToNotion } = require('../notion/client')
const selfDestruct = require('../utils/selfDestruct')

const handleSubmit = async (interaction) => {
  const userData = UserManager.getUser(interaction.user.id)

  if (userData) {
    try {
      const notionPageId = await addUserToNotion(userData, interaction.user)

      // Assign Member role to the user
      const memberRole = interaction.guild.roles.cache.find(role => role.name === 'Club Member')
      if (memberRole) {
        await interaction.member.roles.add(memberRole)
        console.log(`Assigned Club Member role to user ${interaction.user.tag}`)
      } else {
        console.warn('Club Member role not found in guild')
      }

      // Update interaction with success message
      try {
        await interaction.update({
          content:
            `Form submitted successfully! You have been given the ${memberRole} role and now have full access to the server.`,
          components: [],
        })
      } catch (interactionError) {
        // If interaction has expired, send a new message to the channel instead
        if (interactionError.code === 10062) {
          await interaction.channel.send({
            content: `<@${interaction.user.id}> Form submitted successfully! You have been given the ${memberRole} role and now have full access to the server.`,
          })
        } else {
          throw interactionError
        }
      }

      UserManager.printUserData(interaction.user.id) // ! Print User Data
      UserManager.removeUser(interaction.user.id)

      // Self-destruct the current channel
      await selfDestruct(interaction.channel)
    } catch (error) {
      console.error('Error submitting form:', error)
      try {
        await interaction.update({
          content:
            'There was an error submitting your form. Please try again or contact an admin.',
          components: [],
        })
      } catch (interactionError) {
        // If interaction has expired, send a new message to the channel instead
        if (interactionError.code === 10062) {
          await interaction.channel.send({
            content: `<@${interaction.user.id}> There was an error submitting your form. Please try again or contact an admin.`,
          })
        }
      }
    }
  }
}

module.exports = handleSubmit
