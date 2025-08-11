const { Client } = require('@notionhq/client')
const { questions } = require('../questions')

const notion = new Client({ auth: process.env.NOTION_API_KEY })

function convertOptionsToNotion(questionId, valuesArray, type = 'multiSelect') {
  if (!valuesArray) return type === 'multiSelect' ? [] : null

  const question = questions.find((q) => q.id === questionId)
  if (!question || !question.options) return type === 'multiSelect' ? [] : null

  if (type === 'multiSelect') {
    return valuesArray.map((value) => {
      const option = question.options.find((opt) => opt.value === value.trim())
      return {
        name: option ? option.label : value.trim(),
      }
    })
  }

  const option = question.options.find((opt) => opt.value === valuesArray[0])
  return option ? { name: option.label } : null
}

async function addUserToNotion(userData, discordUser) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: userData.responses.name || 'No name provided',
              },
            },
          ],
        },
        Email: {
          email: userData.responses.email || '',
        },
        Games: {
          multi_select: convertOptionsToNotion(
            'games',
            userData.getSelectedOptions('games')
          ),
        },
        'Other Games': {
          rich_text: [
            {
              text: {
                content: userData.responses.other_games || '',
              },
            },
          ],
        },
        'Participation Type': {
          select: convertOptionsToNotion(
            'participation',
            userData.getSelectedOptions('participation'),
            'select'
          ),
        },
        'Discord Features': {
          rich_text: [
            {
              text: {
                content: userData.responses.discord_features || '',
              },
            },
          ],
        },
        Incentives: {
          rich_text: [
            {
              text: {
                content: userData.responses.incentives || '',
              },
            },
          ],
        },
        'Non Gaming Events': {
          rich_text: [
            {
              text: {
                content: userData.responses.non_gaming_events || '',
              },
            },
          ],
        },
        'Exec Comments': {
          rich_text: [
            {
              text: {
                content: userData.responses.exec_comments || '',
              },
            },
          ],
        },
        'Discord Username': {
          rich_text: [
            {
              text: {
                content: discordUser.username,
              },
            },
          ],
        },
        'Discord User ID': {
          number: parseInt(discordUser.id),
        },
        Status: {
          status: {
            name: 'Zero Strikes',
          },
        },
      },
    })

    console.log('Success! New page added to Notion:', response.id)
    return response.id
  } catch (error) {
    console.error('Error adding user to Notion:', error)
    throw error
  }
}

module.exports = { addUserToNotion }
