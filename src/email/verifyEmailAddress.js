function verifyEmailAddress(email) {
  if (!email.endsWith('@gmail.com')) {
    throw new Error(
      'Invalid email address. Please use a university-affiliated email.'
    )
  }
  return true // Or simply don't return anything on success
}

module.exports = { verifyEmailAddress }
