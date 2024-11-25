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
  },
  {
    id: 'year',
    type: 'select',
    question: 'What year of university are you in?',
    options: [
      { label: 'First Year', value: '1' },
      { label: 'Second Year', value: '2' },
      { label: 'Third Year', value: '3' },
      { label: 'Fourth Year', value: '4' },
      { label: 'Graduate Student', value: 'grad' },
    ],
  },
  {
    id: 'interests',
    type: 'multiSelect',
    question: 'What are your areas of interest? (Select all that apply)',
    options: [
      { label: 'Programming', value: 'programming' },
      { label: 'Design', value: 'design' },
      { label: 'Research', value: 'research' },
      { label: 'Project Management', value: 'pm' },
      { label: 'Data Science', value: 'data' },
    ],
    minValues: 1,
    maxValues: 3,
  },
]

module.exports = { questions }
