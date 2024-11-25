// utils/UserManager.js
const { questions } = require('../questions')

// utils/UserManager.js
class UserData {
  constructor(channelId) {
    this.channelId = channelId
    this.currentQuestion = 0
    this.responses = {}
    this.hasUpdatedResponse = false
    this.isNewResponse = true
    this.selectedOptions = new Map() // For storing select menu choices
  }

  updateResponse(questionId, response, type = 'modal') {
    this.isNewResponse = !this.responses[questionId]
    this.hasUpdatedResponse = !this.isNewResponse

    if (type === 'select' || type === 'multiSelect') {
      this.selectedOptions.set(questionId, response)
      this.responses[questionId] = Array.isArray(response)
        ? response.join(', ')
        : response
    } else {
      this.responses[questionId] = response
    }

    if (this.isNewResponse) {
      this.currentQuestion += 1
    }
  }

  getSelectedOptions(questionId) {
    return this.selectedOptions.get(questionId)
  }

  isComplete() {
    return Object.keys(this.responses).length === questions.length
  }
}

// This is how the bot can handle multiple responses at once
class UserManager {
  constructor() {
    this.users = new Map()
  }

  createUser(userId, channelId) {
    const userData = new UserData(channelId)
    this.users.set(userId, userData)
    return userData
  }

  getUser(userId) {
    return this.users.get(userId)
  }

  updateUserResponse(userId, questionId, response, type = 'modal') {
    const userData = this.getUser(userId)
    if (userData) {
      userData.updateResponse(questionId, response, type)
      return userData
    }
    return null
  }

  printUserData(userId) {
    const userData = this.getUser(userId)
    if (userData) {
      console.log(userData.responses)
    }
  }

  removeUser(userId) {
    this.users.delete(userId)
  }
}

module.exports = new UserManager()
