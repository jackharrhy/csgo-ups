const debug = require('debug')('csgoups:db:action:addPerson')

module.exports = ({ utils }) => {
	const { getter, transactionify } = utils;

	return async ({ steamId, discordId }) => {
		debug('getPerson', steamId, discordId);

		return await transactionify(async () => {
			let player, person;

			if (steamId !== undefined) {
				player = await getter('player', 'steam_id', steamId);
				if (player === undefined) return {};
				person = await getter('people', 'id', player.people_id);
			}
			else if (discordId !== undefined) {
				person = await getter('people', 'discord_id', discordId);
				if (person === undefined) return {};
				player = await getter('player', 'people_id', person.id);
			}

			return { person, player };
		});
	};
};
