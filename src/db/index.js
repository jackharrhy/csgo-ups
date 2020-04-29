const debug = require('debug')('csgoups:db:index')
const { readFileSync } = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const initSql = readFileSync(path.join(__dirname, './sql/init.sql'), 'utf8');
const { initUtils } = require('./utils');

module.exports = {
	initDb: async ({ config, logger = console.log }) => {
		const db = await open({
			filename: config.databaseLocation,
			driver: sqlite3.Database
		});

		logger('Database open');

		const {
			objectUpdater,
			objectPutter,
			alreadySeen,
			getter,
			transactionify,
		} = initUtils({ db });

		await db.exec(initSql);

		return {
			addPerson: async ({ name, discordId, steamId }) => {
				debug('addPerson', name, discordId, steamId);

				await transactionify(async () => {
					const seenPersonBefore = await alreadySeen('people', 'discord_id', discordId);
					if (seenPersonBefore) throw new Error('Already seen person before!');

					const { lastID: dbPersonId } = await objectPutter('people', { name, discordId });

					const player = await getter('player', 'steam_id', steamId);

					if (player === undefined) {
						await objectPutter('player', { steamId, peopleId: dbPersonId });
					}
					else {
						await objectUpdater('player', { peopleId: dbPersonId }, 'id', player.id);
					}
				});
			},
			ingestParsedMatch: async (match) => {
				debug('ingestParsedMatch', match.matchId);

				await transactionify(async () => {
					const seenMatchBefore = await alreadySeen('match', 'match_id', parseInt(match.matchId, 10));
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
			},
		};
	},
};
