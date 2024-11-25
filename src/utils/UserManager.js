// utils/UserManager.js
const { questions } = require('../questions')

class UserData {
  constructor(channelId) {
    this.channelId = channelId
    this.currentQuestion = 0
    this.responses = {}
    this.hasUpdatedResponse = false
    this.isNewResponse = true
  }

  updateResponse(questionId, response) {
    this.isNewResponse = !this.responses[questionId]
    this.hasUpdatedResponse = !this.isNewResponse
    this.responses[questionId] = response

    if (this.isNewResponse) {
      this.currentQuestion += 1
    }
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

  updateUserResponse(userId, questionId, response) {
    const userData = this.getUser(userId)
    if (userData) {
      userData.updateResponse(questionId, response)
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
