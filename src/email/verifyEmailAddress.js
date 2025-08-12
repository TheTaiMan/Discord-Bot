const verifyEmailAddress = async (email) => {
  if (!email.endsWith('@myumanitoba.ca')) {
    throw new Error(
      'Invalid email address. Please use your @myumanitoba.ca email.'
    )
  }
  return true
}

module.exports = { verifyEmailAddress }
