const {
  Client,
  GatewayIntentBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

// Setup onboarding channel with button
client.on('messageCreate', async (msg) => {
  if (msg.content === '!setup-onboarding') {
    const channel = await msg.guild.channels.create({
      name: 'onboarding',
      type: ChannelType.GuildText,
    })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('start-onboarding')
        .setLabel('Start Onboarding')
        .setStyle(ButtonStyle.Primary)
    )

    await channel.send({
      content:
        'Welcome to the server! Click the button below to start the onboarding process.',
      components: [row],
    })
    console.log('Onboarding channel and welcome message created!')
  }
})

// Handle button click
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return

  if (interaction.customId === 'start-onboarding') {
    try {
      // Create private channel
      const privateChannel = await interaction.guild.channels.create({
        name: `onboarding-${interaction.user.id}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id, // @everyone role
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: client.user.id, // Bot's ID
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
        ],
      })

      // Create form buttons
      const formRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('form-name')
          .setLabel('Enter Name')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('form-email')
          .setLabel('Enter Email')
          .setStyle(ButtonStyle.Primary)
      )

      // Send initial message in private channel
      await privateChannel.send({
        content: `Welcome ${interaction.user}! Please complete the following form:`,
        components: [formRow],
      })

      // Acknowledge the button click
      await interaction.reply({
        content: `I've created a private channel for you! Please check ${privateChannel}`,
        ephemeral: true,
      })
    } catch (error) {
      console.error('Error creating private channel:', error)
      await interaction.reply({
        content: 'Sorry, there was an error creating your private channel.',
        ephemeral: true,
      })
    }
  }
  if (interaction.customId === 'form-name') {
    const modal = new ModalBuilder()
      .setCustomId('name-modal')
      .setTitle('Enter Your Name')

    const nameInput = new TextInputBuilder()
      .setCustomId('name-input')
      .setLabel('What is your full name?')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(50)
      .setPlaceholder('John Doe')
      .setRequired(true)

    const firstActionRow = new ActionRowBuilder().addComponents(nameInput)
    modal.addComponents(firstActionRow)

    await interaction.showModal(modal)
  }

  // Handle email button click
  if (interaction.customId === 'form-email') {
    const modal = new ModalBuilder()
      .setCustomId('email-modal')
      .setTitle('Enter Your Email')

    const emailInput = new TextInputBuilder()
      .setCustomId('email-input')
      .setLabel('What is your email address?')
      .setStyle(TextInputStyle.Short)
      .setMinLength(5)
      .setMaxLength(100)
      .setPlaceholder('john@example.com')
      .setRequired(true)

    const firstActionRow = new ActionRowBuilder().addComponents(emailInput)
    modal.addComponents(firstActionRow)

    await interaction.showModal(modal)
  }
})

// Handle modal submissions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return

  // Handle name modal submission
  if (interaction.customId === 'name-modal') {
    const name = interaction.fields.getTextInputValue('name-input')
    await interaction.reply({
      content: `Thank you! Your name (${name}) has been recorded.`,
      ephemeral: true,
    })
  }

  // Handle email modal submission
  if (interaction.customId === 'email-modal') {
    const email = interaction.fields.getTextInputValue('email-input')
    await interaction.reply({
      content: `Thank you! Your email (${email}) has been recorded.`,
      ephemeral: true,
    })
  }
})

client.login(
  'MTMwOTcwMTAyMTg3Mzg2NDc1NA.GH0TPO.6m7D_TZegvWvLT-3awQZCY45VNbYBGwmR7mgiQ'
)
