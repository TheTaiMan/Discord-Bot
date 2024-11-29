const { Client } = require('@notionhq/client')

const notion = new Client({ auth: process.env.NOTION_API_KEY })

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
          select: {
            name: convertYearValue(userData.responses.year),
          },
        },
        Interests: {
          multi_select: convertInterests(userData.responses.interests || []),
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

function convertYearValue(year) {
  const yearMap = {
    1: 'First Year',
    2: 'Second Year',
    3: 'Third Year',
    4: 'Fourth Year',
    grad: 'Graduate Student',
  }
  return yearMap[year] || 'Not Specified'
}

function convertInterests(interests) {
  if (!Array.isArray(interests)) return []
  return interests.map((interest) => ({
    name: interest,
  }))
}

module.exports = { addUserToNotion }
