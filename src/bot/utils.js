const codeBlockify = (text) => `\`\`\`${text}\`\`\``;
const langCodeBlockify = (lang, text) => codeBlockify(`${lang}\n${text}`);
const jsonCodeBlockify = (text) => langCodeBlockify('json', text);

module.exports = {
	codeBlockify,
	langCodeBlockify,
	jsonCodeBlockify,
};
