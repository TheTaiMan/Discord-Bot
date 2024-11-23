const userResponses = new Map()

function initializeUser(userId, channelId) {
  userResponses.set(userId, {
    channelId,
    currentQuestion: 0,
    responses: {},
  })
}

function getUserData(userId) {
  return userResponses.get(userId)
}

function updateUserResponse(userId, questionId, response) {
  const userData = userResponses.get(userId)
  if (userData) {
    userData.responses[questionId] = response
    userData.currentQuestion += 1
    userResponses.set(userId, userData)
  }
  return userData
}

module.exports = {
  initializeUser,
  getUserData,
  updateUserResponse,
}
