const { parseRawMatch } = require('../../match');

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

			const [, embed] = await matchEmbedFromParsedMatch(parsedMatch);
			msg.channel.send('PREVIEW - none of this data will be stored in the database:', { embed });
		};
	},
};
