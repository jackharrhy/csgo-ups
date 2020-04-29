const debug = require('debug')('csgoups:db:action:addPerson')

module.exports = {
	initAction: ({ utils }) => {
		const { getter } = utils;

		return async ({ steamId }) => {
			debug('getPerson', steamId);

			const player = await getter('player', 'steam_id', steamId);
			if (player === undefined) return undefined;

			return {
				person: await getter('people', 'id', player.people_id),
				player
			};
		};
	},
};
