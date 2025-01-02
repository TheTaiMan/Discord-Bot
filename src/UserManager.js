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

    // Email verification properties
    this.verificationCode = null
    this.emailForVerification = null
    this.verificationAttempts = 0
    this.lastEmailStatus = null
    this.originalButtonMessageId = null
    this.statusMessageId = null
    this.sendCodeMessageId = null
  }

  advanceToNextQuestion() {
    if (this.isNewResponse) {
      this.currentQuestion++
    }
  }

  getSelectedOptions(questionId) {
    return this.selectedOptions.get(questionId)
  }

  isComplete() {
    return Object.keys(this.responses).length === questions.length
  }

  skipQuestion(questionId) {
    const isExistingResponse = this.responses.hasOwnProperty(questionId)
    this.isNewResponse = !isExistingResponse
    this.hasUpdatedResponse = isExistingResponse

    this.responses[questionId] = 'Skipped'
    this.advanceToNextQuestion()

    return {
      isNewResponse: this.isNewResponse,
      hasUpdatedResponse: this.hasUpdatedResponse,
    }
  }

  setEmailForVerification(email) {
    this.emailForVerification = email.toLowerCase()
  }

  markEmailAsVerified(email) {
    this.responses['email'] = email
  }

  // New methods
  setStatusMessageId(messageId) {
    this.statusMessageId = messageId
  }

  setOriginalButtonMessageId(messageId) {
    this.originalButtonMessageId = messageId
  }

  incrementVerificationAttempts() {
    this.verificationAttempts++
    return this.verificationAttempts
  }

  hasExceededVerificationAttempts() {
    return this.verificationAttempts >= 3
  }

  resetEmailVerification() {
    this.verificationCode = null
    this.emailForVerification = null
    this.statusMessageId = null
    this.lastEmailStatus = null
    this.originalButtonMessageId = null
  }

  updateEmailStatus(status) {
    if (this.lastEmailStatus === 'delivered' && status === 'request') {
      return false
    }
    this.lastEmailStatus = status
    return true
  }

  updateResponse(questionId, response, type = 'modal') {
    const isExistingResponse = this.responses.hasOwnProperty(questionId)
    this.isNewResponse = !isExistingResponse
    this.hasUpdatedResponse = isExistingResponse

    if (type === 'select' || type === 'multiSelect') {
      const selectedValues = Array.isArray(response) ? response : [response]
      this.selectedOptions.set(questionId, selectedValues)
      this.responses[questionId] = selectedValues.join(', ')
    } else {
      this.responses[questionId] = response
    }

    this.advanceToNextQuestion()
  }
}

class UserManager {
  constructor() {
    this.users = new Map()
  }

  createUser(userId, channelId) {
    const userData = new UserData(channelId, userId)
    this.users.set(userId, userData)
    this.printAllUserData()
    return userData
  }

  getUser(userId) {
    return this.users.get(userId)
  }

  updateUserResponse(userId, questionId, response, type = 'modal') {
    const userData = this.getUser(userId)
    if (userData) {
      userData.updateResponse(questionId, response, type)
      this.printAllUserData()
      return userData
    }
    return null
  }

  skipQuestion(userId, questionId) {
    const userData = this.getUser(userId)
    if (userData) {
      const result = userData.skipQuestion(questionId)
      this.printAllUserData()
      return result
    }
    return null
  }

  removeUser(userId) {
    this.users.delete(userId)
    this.printAllUserData()
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
        selectedOptions: Object.fromEntries(userData.selectedOptions),
        summaryMessageId: userData.summaryMessageId,
        verificationCode: userData.verificationCode,
        emailForVerification: userData.emailForVerification,
        verificationAttempts: userData.verificationAttempts,
        statusMessageId: userData.statusMessageId,
        lastEmailStatus: userData.lastEmailStatus,
        originalButtonMessageId: userData.originalButtonMessageId,
      })
    })
    console.log('-------------------------')
  }
}

module.exports = new UserManager()
