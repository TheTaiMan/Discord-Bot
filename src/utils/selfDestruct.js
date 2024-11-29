const { setTimeout } = require('node:timers/promises')

async function selfDestruct(channel, options = {}) {
  const {
    countdownEmojis = [
      '🔟',
      '9️⃣',
      '8️⃣',
      '7️⃣',
      '6️⃣',
      '5️⃣',
      '4️⃣',
      '3️⃣',
      '2️⃣',
      '1️⃣',
    ],
    explosionEmojis = ['💥', '🧨', '☢️', '🚀', '🔥'],
  } = options

  try {
    // Send separate countdown messages
    await channel.send(`# Channel Self-Destructing In:`)

    for (let i = 0; i < countdownEmojis.length; i++) {
      await channel.send(`${countdownEmojis[i]}`)
      await setTimeout(1000) // 1 second pause between each number
    }

    // Explosion message
    const explosionEmoji =
      explosionEmojis[Math.floor(Math.random() * explosionEmojis.length)]

    await channel.send(
      `# ${explosionEmoji} 💥 ${explosionEmoji}`
    )

    // Short pause before deletion
    await setTimeout(500)

    // Delete the channel
    await channel.delete('Onboarding process completed')
  } catch (error) {
    console.error('Error during channel self-destruction:', error)
  }
}

module.exports = selfDestruct
