const UserManager = require('../UserManager')
const createChannel = require('../components/createChannel')
const sendNextQuestion = require('../components/sendNextQuestion')


// Handles the On Boarding Button press
const handleOnboarding = async (interaction) => {
  try {
    // Check if a channel already exists for this user
    const existingChannel = interaction.guild.channels.cache.find(
      (channel) => channel.name === `onboarding-${interaction.user.id}`
    )

    if (existingChannel) {
      // If channel exists, direct them to it
      await interaction.reply({
        content: `You already have an ongoing verification process. Please check ${existingChannel} to complete your verification.`,
        ephemeral: true,
      })
      return
    }

    // If no channel exists, create a new one
    const channel = await createChannel(interaction)
    const userData = UserManager.createUser(interaction.user.id, channel.id)

    // Welcome Message
    await channel.send({
      content:
        'Welcome! We want to confirm that you are a university student for you to be a member and have full access to the server.',
    })

    await sendNextQuestion(channel, userData)
    await interaction.reply({
      content: `Please check ${channel} to complete your verification.`,
      ephemeral: true,
    })
  } catch (error) {
    console.error('Channel creation error:', error)
    await interaction.reply({
      content: 'Sorry, there was an error creating your private channel.',
      ephemeral: true,
    })
  }
}

module.exports = handleOnboarding
