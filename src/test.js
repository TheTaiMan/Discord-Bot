const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
} = require('discord.js')
const { Client: NotionClient } = require('@notionhq/client')
require('dotenv').config()

// Initialize Discord client with necessary intents
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
})

// Initialize Notion client
const notion = new NotionClient({
  auth: process.env.NOTION_TOKEN,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID

// Function to find a Notion page for a given Discord user ID
async function findNotionPage(discordId) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Discord ID',
        rich_text: {
          equals: discordId.toString(),
        },
      },
    })

    return response.results[0]?.id
  } catch (error) {
    console.error('Error finding Notion page:', error)
    return null
  }
}

// Function to update roles in Notion
async function updateNotionRoles(pageId, roles) {
  try {
    const roleNames = roles
      .filter((role) => role.name !== '@everyone')
      .map((role) => ({ name: role.name }))

    await notion.pages.update({
      page_id: pageId,
      properties: {
        Roles: {
          multi_select: roleNames,
        },
        'Last Updated': {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
    })
  } catch (error) {
    console.error('Error updating Notion roles:', error)
    throw error
  }
}

// Discord bot events
discord.once(Events.ClientReady, () => {
  console.log(`Logged in as ${discord.user.tag}`)

  // Register slash command
  const command = new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Manually sync roles with Notion')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user to sync roles for (defaults to you)')
        .setRequired(false)
    )

  discord.application.commands.create(command)
})

// Handle role changes
discord.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  // Check if roles have changed
  if (
    oldMember.roles.cache.size !== newMember.roles.cache.size ||
    !oldMember.roles.cache.every((role) => newMember.roles.cache.has(role.id))
  ) {
    try {
      const pageId = await findNotionPage(newMember.id)

      if (pageId) {
        await updateNotionRoles(
          pageId,
          Array.from(newMember.roles.cache.values())
        )
        console.log(`Updated roles for user ${newMember.user.tag} in Notion`)
      } else {
        console.log(`No Notion page found for user ${newMember.user.tag}`)
      }
    } catch (error) {
      console.error(`Error updating roles for ${newMember.user.tag}:`, error)
    }
  }
})

// Handle slash commands
discord.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return

  if (interaction.commandName === 'sync') {
    await interaction.deferReply()

    try {
      const targetUser = interaction.options.getUser('user') || interaction.user
      const member = await interaction.guild.members.fetch(targetUser.id)

      const pageId = await findNotionPage(member.id)

      if (pageId) {
        await updateNotionRoles(pageId, Array.from(member.roles.cache.values()))
        await interaction.editReply(
          `Successfully synced roles for ${member.user.tag}`
        )
      } else {
        await interaction.editReply(
          `No Notion page found for ${member.user.tag}`
        )
      }
    } catch (error) {
      console.error('Error handling sync command:', error)
      await interaction.editReply('An error occurred while syncing roles.')
    }
  }
})

// Error handling
discord.on('error', (error) => {
  console.error('Discord client error:', error)
})

// Initialize the bot
async function main() {
  // Check for required environment variables
  const requiredEnvVars = [
    'DISCORD_TOKEN',
    'NOTION_TOKEN',
    'NOTION_DATABASE_ID',
  ]
  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  )

  if (missingEnvVars.length > 0) {
    console.error(
      'Missing required environment variables:',
      missingEnvVars.join(', ')
    )
    process.exit(1)
  }

  try {
    await discord.login(process.env.DISCORD_TOKEN)
  } catch (error) {
    console.error('Failed to start bot:', error)
    process.exit(1)
  }
}

main()





const testDiscord = () => {
  // Retrieve the discord token



  // Create a discord UI button that says "Start Obboarding"




  // When user presses button, give an indivual message that says that the user needs to go to this sprcific channel. You should 
}