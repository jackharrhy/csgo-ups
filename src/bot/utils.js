module.exports = {
	codeBlockify: (text) => `\`\`\`${text}\`\`\``,
	langCodeBlockify: (lang, text) => codeBlockify(`${lang}\n${text}`),
	jsonCodeBlockify: (text) => langCodeBlockify('json', text),
};
