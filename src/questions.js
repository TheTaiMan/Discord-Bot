// questions.js

const questions = [
  {
    id: 'name',
    type: 'modal',
    question: 'What is your full name?',
    buttonLabel: 'Enter Full Name',
    modalTitle: 'Full Name',
    modalLabel: 'What is your full name?',
    placeholder: 'John Joe',
    inputStyle: 'Short',
    required: true,
  },
  {
    id: 'email',
    type: 'modal',
    question: 'What is your student email address?',
    buttonLabel: 'Enter Email',
    modalTitle: 'Student Email',
    modalLabel: 'What is your student email address?',
    placeholder: 'student@university.edu',
    inputStyle: 'Short',
    required: true,
  },
  {
    id: 'year',
    type: 'select',
    question: 'What year of university are you in?',
    placeholder: 'Year',
    options: [
      { label: 'First Year', value: '1' },
      { label: 'Second Year', value: '2' },
      { label: 'Third Year', value: '3' },
      { label: 'Fourth Year', value: '4' },
      { label: 'Graduate Student', value: 'grad' },
    ],
    required: false,
  },
  {
    id: 'interests',
    type: 'multiSelect',
    question: 'What are your areas of interest? (Select all that apply)',
    placeholder: 'Interests',
    options: [
      { label: 'Programming', value: 'programming' },
      { label: 'Design', value: 'design' },
      { label: 'Research', value: 'research' },
      { label: 'Project Management', value: 'pm' },
      { label: 'Data Science', value: 'data' },
    ],
    minValues: 1,
    maxValues: 3,
    required: false,
  },
]

module.exports = { questions }

// TODO: Make it so if a form is required or not, this would mean

/*
 * for verification code, you should have a button saying send verification code, and then it should update with 'sent' if its actually sent, if there is an error say there is one, and
 * ask if they want the code to resend, and if there is a persistent error tell them to contact the mod.
 * if its sent successfully then there will be 2 buttons, enter verification code or resend.
 */
