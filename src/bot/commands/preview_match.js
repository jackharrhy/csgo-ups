module.exports = {
	trigger: 'previewmatch',
	args: '<csgo sharecode>',
	name: 'Preview Match',
	desc: 'previews what pushups will be distributed given a match, without affecting the database',
	requiresAdmin: false,
	init: ({csgo, common: {matchEmbedFromParsedMatch}}) => {
		return async(msg, args) => {
			const shareCode = args;
			const match = await csgo.matchFromShareCode(shareCode);
			const parsedMatch = parseRawMatch(shareCode, match);

			const [content, embed] = matchEmbedFromParsedMatch(parsedMatch);
			msg.channel.send(content, { embed });
		};
	},
};
