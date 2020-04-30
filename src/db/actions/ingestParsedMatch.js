const debug = require('debug')('csgoups:db:action:ingestParsedMatch')

module.exports = ({utils}) => {
	const {
		objectPutter,
		alreadySeen,
		getter,
		transactionify,
	} = utils;

	return async (match) => {
		debug('ingestParsedMatch', match.matchId);

		await transactionify(async () => {
			const seenMatchBefore = await alreadySeen('match', 'match_id', match.matchId);
			if (seenMatchBefore) throw new Error('Already seen match before!');
			const { lastID: dbMatchId } = await objectPutter('match', match);

			const dbRoundIds = [];
			for (let index = 0; index < match.rounds; index++) {
				const { lastID: dbRoundId } = await objectPutter('round', {
					matchId: dbMatchId,
					number: index + 1,
					duration: match.roundDurations[index],
				});
				dbRoundIds.push(dbRoundId);
			}

			for (const team of match.teams) {
				const { lastID: dbTeamId } = await objectPutter('team', {
					matchId: dbMatchId,
					score: team.finalScore,
				});

				for (let index = 0; index < team.scores.length; index++) {
					await objectPutter('round_score', {
						roundId: index,
						teamId: dbTeamId,
						score: team.scores[index],
					});
				}

				for (const steamId in team.players) {
					const seenPlayerBefore = await alreadySeen('player', 'steam_id', steamId);

					let dbPlayerId;
					if (seenPlayerBefore) {
						const player = await getter('player', 'steam_id', steamId);
						dbPlayerId = player.id;

						if (player.people_id) {
							const punishment = match.punishments[steamId];

							if (punishment !== undefined) {
								const dbPlayerPunishmentId = (await objectPutter(
									'player_punishment',
									{ playerId: dbPlayerId, pushups: punishment.pushups },
								)).lastID;

								for (const {reason, change} of punishment.reasons) {
									await objectPutter('punishment_reason', {
										playerPunishmentId: dbPlayerPunishmentId,
										reason,
										change,
									});
								}
							}
						}
					}
					else {
						dbPlayerId = (await objectPutter('player', { steamId })).lastID;
					}

					const playersRounds = team.players[steamId].rounds;

					let dbFinalStatsId;
					for (let index = 0; index < playersRounds.length; index++) {
						const roundStats = playersRounds[index];
						const { lastID: dbRoundPlayerStatsId } = await objectPutter('round_player_stats', {
							roundId: index,
							playerId: dbPlayerId,
							...roundStats,
						});
						dbFinalStatsId = dbRoundPlayerStatsId;
					}

					await objectPutter('played_in', {
						playerId: dbPlayerId,
						matchId: dbMatchId,
						teamId: dbTeamId,
						finalStatsId: dbFinalStatsId,
					});
				}
			}
		});
	};
};
