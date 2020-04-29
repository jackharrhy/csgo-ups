module.exports = {
	trigger: 'addmatch',
	args: '<csgo sharecode>',
	name: 'Add Match',
	desc: 'adds a match to the database, distributing pushups too',
	requiresAdmin: true,
	init: ({db, csgo, common: {matchEmbedFromParsedMatch}}) => {
		return async(msg, args) => {
			const shareCode = args;
			const match = await csgo.matchFromShareCode(shareCode);
			const parsedMatch = parseRawMatch(shareCode, match);
			await db.ingestParsedMatch(parsedMatch);

			const [content, embed] = matchEmbedFromParsedMatch(parsedMatch);
			msg.channel.send(content, { embed });
		};
	},
};
