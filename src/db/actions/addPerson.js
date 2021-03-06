const debug = require('debug')('csgoups:db:action:addPerson')

module.exports = ({ utils }) => {
	const {
		objectPutter,
		alreadySeen,
		getter,
		transactionify,
	} = utils;

	return async ({ name, discordId, steamId, guildId }) => {
		debug('addPerson', name, discordId, steamId);

		await transactionify(async () => {
			const seenPersonBefore = await alreadySeen('people', 'discord_id', discordId);
			if (seenPersonBefore) throw new Error('Already seen person before!');

			const { lastID: dbPersonId } = await objectPutter('people', { name, discordId });

			await objectPutter('guild_association', { peopleId: dbPersonId, guildId });

			const player = await getter('player', 'steam_id', steamId);

			if (player === undefined) {
				await objectPutter('player', { steamId, peopleId: dbPersonId });
			}
			else {
				await objectUpdater('player', { peopleId: dbPersonId }, 'id', player.id);
			}
		});
	};
};
