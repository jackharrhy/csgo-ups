const debug = require('debug')('csgoups:db:action:toggleAdmin')

module.exports = ({ utils }) => {
	const {
		objectPutter,
		alreadySeen,
		getter,
		transactionify,
		remover,
	} = utils;

	return async ({ discordId }) => {
		debug('toggleAdmin', discordId);

		return await transactionify(async () => {
			const seenPersonBefore = await alreadySeen('people', 'discord_id', discordId);
			if (!seenPersonBefore) throw new Error('Haven\'t seen person before!');

			const person = await getter('people', 'discord_id', discordId);
			const isAdmin = await alreadySeen('admin', 'people_id', person.id);

			if (isAdmin) {
				debug('Removing admin');
				await remover('admin', 'people_id', person.id);
				return false;
			} else {
				debug('Adding admin');
				await objectPutter('admin', { peopleId: person.id });
				return true;
			}
		});
	};
};
