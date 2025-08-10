const SibApiV3Sdk = require('sib-api-v3-sdk')
const UserManager = require('../UserManager')

const defaultClient = SibApiV3Sdk.ApiClient.instance

let apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

// Function to send a verification email
async function sendVerificationEmail(email, verificationCode, userData) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
  sendSmtpEmail.subject = 'Your Verification Code'
  sendSmtpEmail.htmlContent = `<html><body><p>Your verification code is: <strong>${verificationCode}</strong></p></body></html>`
  sendSmtpEmail.sender = {
    name: 'Discord Bot',
    email: process.env.BREVO_SENDER_EMAIL,
  }
  sendSmtpEmail.to = [{ email: email }]

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('Verification email sent successfully:', data)
    userData.incrementVerificationAttempts()
    
    // Store email mapping for webhook lookups
    UserManager.addEmailMapping(email, userData.userId)
    
    return data
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw error
  }
}

module.exports = { sendVerificationEmail }
