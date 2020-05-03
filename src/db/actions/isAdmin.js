const debug = require('debug')('csgoups:db:action:isAdmin')

module.exports = ({ utils }) => {
	const {
		alreadySeen,
		transactionify,
		getter,
	} = utils;

	return async ({ discordId }) => {
		debug('isAdmin', discordId);

		return await transactionify(async () => {
			const seenPersonBefore = await alreadySeen('people', 'discord_id', discordId);
			if (!seenPersonBefore) return false;

			const person = await getter('people', 'discord_id', discordId);
			return await alreadySeen('admin', 'people_id', person.id);
		});
	};
};
