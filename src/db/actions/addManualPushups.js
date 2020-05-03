const debug = require('debug')('csgoups:db:action:addManualPushups')

module.exports = ({ utils }) => {
	const {
		objectPutter,
		alreadySeen,
		getter,
		transactionify,
	} = utils;

	return async ({ invokerDiscordId, discordId, amount, reason }) => {
		debug('addManualPushups', invokerDiscordId, discordId, amount, reason);

		await transactionify(async () => {
			const seenPersonBefore = await alreadySeen('people', 'discord_id', discordId);
			if (!seenPersonBefore) throw new Error('Haven\'t seen person before!');

			const person = await getter('people', 'discord_id', discordId);
			const player = await getter('player', 'people_id', person.id);

			const dbPlayerPunishmentId = (await objectPutter(
				'player_punishment',
				{
					playerId: player.id,
					pushups: amount,
					timestamp: (new Date()).toISOString(),
				},
			)).lastID;

			const invokerPerson = await getter('people', 'discord_id', invokerDiscordId);

			await objectPutter(
				'player_manual_punishment',
				{
					playerPunishmentId: dbPlayerPunishmentId,
					invokerPeopleId: invokerPerson.id,
				},
			);

			await objectPutter('punishment_reason', {
				playerPunishmentId: dbPlayerPunishmentId,
				reason,
				change: amount,
			});
		});
	};
};
