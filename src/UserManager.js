const { questions } = require('./questions')

class UserData {
  constructor(channelId, userId) {
    this.channelId = channelId
    this.userId = userId // Store userId
    this.currentQuestion = 0
    this.responses = {}
    this.hasUpdatedResponse = false
    this.isNewResponse = true
    this.selectedOptions = new Map()
    this.summaryMessageId = null
    this.verificationCode = null
    this.verificationStatus = 'pending'
    this.isVerified = false
    this.emailForVerification = null
    this.verificationInteraction = null
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
    return (
      Object.keys(this.responses).length === questions.length && this.isVerified
    )
  }
}

// This is how the bot can handle multiple responses at once
class UserManager {
  constructor() {
    this.users = new Map()
  }

  createUser(userId, channelId) {
    const userData = new UserData(channelId, userId) // Pass userId to UserData
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

  skipQuestion(userId, questionId) {
    const user = this.users.get(userId)
    if (user) {
      user.responses[questionId] = 'Skipped'
      user.currentQuestion++
    }
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

  setVerificationInteraction(userId, interaction) {
    const userData = this.getUser(userId)
    if (userData) {
      userData.verificationInteraction = interaction
    }
  }

  getVerificationInteraction(userId) {
    const userData = this.getUser(userId)
    return userData ? userData.verificationInteraction : null
  }
}

module.exports = new UserManager()
