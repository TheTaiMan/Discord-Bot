const { questions } = require('./questions')

class UserData {
  constructor(channelId, userId) {
    this.channelId = channelId
    this.userId = userId
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
    const isExistingResponse = this.responses.hasOwnProperty(questionId)
    this.isNewResponse = !isExistingResponse
    this.hasUpdatedResponse = isExistingResponse

    if (type === 'select' || type === 'multiSelect') {
      this.selectedOptions.set(questionId, response)
      this.responses[questionId] = Array.isArray(response)
        ? response.join(', ')
        : response
    } else {
      this.responses[questionId] = response
    }

    // Move to the next question if it's a new response
    if (this.isNewResponse) {
      this.currentQuestion++
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

  skipQuestion(questionId) {
    const isExistingResponse = this.responses.hasOwnProperty(questionId)
    this.isNewResponse = !isExistingResponse
    this.hasUpdatedResponse = isExistingResponse

    this.responses[questionId] = 'Skipped'

    // Move to the next question if it's a new skip
    if (this.isNewResponse) {
      this.currentQuestion++
    }

    return {
      isNewResponse: this.isNewResponse,
      hasUpdatedResponse: this.hasUpdatedResponse,
    }
  }
}

class UserManager {
  constructor() {
    this.users = new Map()
  }

  createUser(userId, channelId) {
    const userData = new UserData(channelId, userId)
    this.users.set(userId, userData)
    this.printAllUserData() // ! Print after user creation
    return userData
  }

  getUser(userId) {
    return this.users.get(userId)
  }

  updateUserResponse(userId, questionId, response, type = 'modal') {
    const userData = this.getUser(userId)
    if (userData) {
      userData.updateResponse(questionId, response, type)
      this.printAllUserData() // ! Print after updating response
      return userData
    }
    return null
  }

  skipQuestion(userId, questionId) {
    const userData = this.getUser(userId)
    if (userData) {
      const result = userData.skipQuestion(questionId)
      this.printAllUserData() // ! Print after skipping question
      return result
    }
    return null
  }

  printUserData(userId) {
    const userData = this.getUser(userId)
    if (userData) {
      console.log(`User ID: ${userId}`, userData.responses)
    }
  }

  printAllUserData() {
    console.log('--- Current User Data ---')
    if (this.users.size === 0) {
      console.log('No users currently.')
      return
    }
    this.users.forEach((userData, userId) => {
      console.log(`User ID: ${userId}`, {
        channelId: userData.channelId,
        userId: userData.userId,
        currentQuestion: userData.currentQuestion,
        responses: userData.responses,
        hasUpdatedResponse: userData.hasUpdatedResponse,
        isNewResponse: userData.isNewResponse,
        selectedOptions: Object.fromEntries(userData.selectedOptions), // Convert Map to object for printing
        summaryMessageId: userData.summaryMessageId,
        verificationCode: userData.verificationCode,
        verificationStatus: userData.verificationStatus,
        isVerified: userData.isVerified,
        emailForVerification: userData.emailForVerification,
        verificationInteraction: userData.verificationInteraction,
      })
    })
    console.log('-------------------------')
  }

  removeUser(userId) {
    this.users.delete(userId)
    this.printAllUserData() // ! Print after removing user
  }

  setVerificationInteraction(userId, interaction) {
    const userData = this.getUser(userId)
    if (userData) {
      userData.verificationInteraction = interaction
      this.printAllUserData() // ! Print after removing user
    }
  }

  getVerificationInteraction(userId) {
    const userData = this.getUser(userId)
    return userData ? userData.verificationInteraction : null
  }

  moveToQuestion(userId, questionId) {
    const userData = this.getUser(userId)
    if (userData) {
      userData.moveToQuestion(questionId)
      this.printAllUserData() // ! Print after removing user
    }
  }
}

module.exports = new UserManager()
