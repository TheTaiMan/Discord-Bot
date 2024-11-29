function formatResponseSummary(responses) {
  return Object.entries(responses)
    .map(
      ([key, value]) =>
        `**${key.charAt(0).toUpperCase() + key.slice(1)}**: ${value}`
    )
    .join('\n')
}

module.exports = formatResponseSummary
