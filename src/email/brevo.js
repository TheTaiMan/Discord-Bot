const SibApiV3Sdk = require('sib-api-v3-sdk')

const defaultClient = SibApiV3Sdk.ApiClient.instance

let apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY // Ensure you have BREVO_API_KEY in your .env file

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

// Function to send a verification email
async function sendVerificationEmail(email, verificationCode) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
  sendSmtpEmail.subject = 'Your Verification Code'
  sendSmtpEmail.htmlContent = `<html><body><p>Your verification code is: <strong>${verificationCode}</strong></p></body></html>`
  sendSmtpEmail.sender = {
    name: 'Discord Bot',
    email: process.env.BREVO_SENDER_EMAIL,
  } // Ensure you have BREVO_SENDER_EMAIL in your .env
  sendSmtpEmail.to = [{ email: email }]

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('Verification email sent successfully:', data)
    return true
  } catch (error) {
    console.error('Error sending verification email:', error)
    return false
  }
}

module.exports = { sendVerificationEmail }
