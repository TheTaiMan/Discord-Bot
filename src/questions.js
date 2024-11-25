const questions = [
  {
    id: 'name',
    question: 'What is your full name?',
    buttonLabel: 'Enter Full Name',
    modalTitle: 'Full Name',
    modalLabel: 'What is your full name?',
    placeholder: 'John Joe',
    inputStyle: 'Short',
  },
  {
    id: 'email',
    question: 'What is your student email address?',
    buttonLabel: 'Enter Email',
    modalTitle: 'Student Email',
    modalLabel: 'What is your student email address?',
    placeholder: 'student@university.edu',
    inputStyle: 'Short', // inputStyle: 'Short' or 'Paragraph'
  },
  // Add more questions following the same format
]

module.exports = { questions }
