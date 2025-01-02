const verifyEmailAddress = async (email) => {
  if (!email.endsWith('@gmail.com')) {
    throw new Error(
      'Invalid email address. Please use a university-affiliated email.'
    )
  }
  return true
}

module.exports = { verifyEmailAddress }
