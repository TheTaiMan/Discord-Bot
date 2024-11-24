// utils/UserManager.js
const { questions } = require('./modalBuilder')

class UserData {
  constructor(channelId) {
    this.channelId = channelId
    this.currentQuestion = 0
    this.responses = {}
    this.timestamp = new Date()
  }

  updateResponse(questionId, response) {
    this.responses[questionId] = response
    this.currentQuestion += 1
  }

  isComplete() {
    return Object.keys(this.responses).length === questions.length
  }
}

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
