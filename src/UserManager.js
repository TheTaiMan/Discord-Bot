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
    this.emailForVerification = null
    this.verificationInteraction = null
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
    this.emailForVerification = email
  }

  markEmailAsVerified(email) {
    this.responses['email'] = email
    this.emailForVerification = null
    this.verificationInteraction = null
    this.verificationStatus = 'pending' // Reset to 'pending' even though its complete
    this.verificationCode = null
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
        emailForVerification: userData.emailForVerification,
        /* verificationInteraction: userData.verificationInteraction, */
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
    }
  }

  getVerificationInteraction(userId) {
    const userData = this.getUser(userId)
    return userData ? userData.verificationInteraction : null
  }
}

module.exports = new UserManager()
