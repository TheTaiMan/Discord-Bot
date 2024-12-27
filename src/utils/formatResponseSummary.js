function formatResponseSummary(responses, questions) {
  return Object.entries(responses)
    .map(([key, value]) => {
      const question = questions.find((q) => q.id === key)
      let displayValue = value

      if (value === 'Skipped') {
        displayValue = '`Skipped`' // Format as inline code for skipped questions
      } else if (question) {
        if (question.type === 'multiSelect') {
          const valuesArray = value.split(',').map((v) => v.trim())
          displayValue = valuesArray
            .map((val) => {
              const option = question.options.find((opt) => opt.value === val)
              return option ? `- ${option.label}` : `- Unknown Option: ${val}`
            })
            .join('\n')
        } else if (question.type === 'select') {
          const option = question.options.find((opt) => opt.value === value)
          displayValue = option ? option.label : `Unknown Option: ${value}`
        }
      }

      return `**${
        question?.question || key.charAt(0).toUpperCase() + key.slice(1)
      }**\n> ${displayValue.split('\n').join('\n> ')}` // Use quote block
    })
    .join('\n\n')
}

module.exports = formatResponseSummary
