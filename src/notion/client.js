const { Client } = require('@notionhq/client')
const { questions } = require('../questions')

const notion = new Client({ auth: process.env.NOTION_API_KEY })

function convertOptionsToNotion(questionId, values, type = 'multiSelect') {
  if (!values) return type === 'multiSelect' ? [] : null

  // Ensure values is an array, even for single select
  const valuesArray =
    type === 'select'
      ? [values]
      : Array.isArray(values)
      ? values
      : values.split(', ')

  const question = questions.find((q) => q.id === questionId)
  if (!question || !question.options) return type === 'multiSelect' ? [] : null

  // For multi-select, return an array of objects with labels
  if (type === 'multiSelect') {
    return valuesArray.map((value) => {
      const option = question.options.find((opt) => opt.value === value.trim())
      return {
        name: option ? option.label : value.trim(),
      }
    })
  }

  // For single select, find the matching label
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
        Year: {
          select: convertOptionsToNotion(
            'year',
            userData.responses.year,
            'select'
          ),
        },
        Interests: {
          multi_select: convertOptionsToNotion(
            'interests',
            userData.responses.interests
          ),
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
        'Discord ID': {
          number: parseInt(discordUser.id),
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
