const SteamID = require('steamid');

const statKeys = ['kills', 'assists', 'deaths', 'scores', 'enemy_kills', 'enemy_headshots', 'mvps'];

function parseRound(round) {
	const stats = {};
	for (const key of statKeys) {
		stats[key] = round[key];
	}

	const accounts = round.reservation.account_ids;

	const results = {
		duration: round.match_duration,
		teams: [
			{
				score: round.team_scores[0],
				results: {},
			},
			{
				score: round.team_scores[1],
				results: {},
			},
		]
	};

	for (let index = 0; index < accounts.length; index++) {
		const account = accounts[index];
		const sid = SteamID.fromIndividualAccountID(account).getSteam2RenderedID();
		const result = {};

		for (const key of statKeys) {
			result[key] = stats[key][index];
		}

		let target;
		if (index < 5) {
			target = results.teams[0].results;
		} else {
			target = results.teams[1].results;
		}

		target[sid] = result;
	}

	return results;
}

function calculateTopBottomFraggers(match) {
	for (const team of match.teams) {
		let mostKills, topFraggers;
		let leastKills, bottomFraggers;

		for (const player in team.players) {
			const rounds = team.players[player].rounds;
			const finalStats = rounds[rounds.length - 1];

			if (mostKills === undefined) {
				mostKills = finalStats.kills;
				topFraggers = [player];
			} else {
				if (finalStats.kills > mostKills) {
					leastKills = finalStats.kills;
					topFraggers = [player];
				} else if (finalStats.kills === mostKills) {
					topFraggers.push[player];
				}
			}

			if (leastKills === undefined) {
				leastKills = finalStats.kills;
				bottomFraggers = [player];
			} else {
				if (finalStats.kills < leastKills) {
					leastKills = finalStats.kills;
					bottomFraggers = [player];
				} else if (finalStats.kills === leastKills) {
					bottomFraggers.push[player];
				}
			}

			team.players[player].finalStats = finalStats;
		}

		team.bottomFraggers = bottomFraggers;
		team.topFraggers = topFraggers;
	}
}

function calculateFinalScores(match) {
	match.tie = false;

	for (const team of match.teams) {
		team.finalScore = team.scores[team.scores.length - 1];
		team.winner = false;
		team.loss = false;
	}

	if (match.teams[0].finalScore == match.teams[1].finalScore) {
		match.tie = true;
	}
	else if (match.teams[0].finalScore > match.teams[1].finalScore) {
		match.teams[0].win = true;
	}
	else {
		match.teams[1].loss = true;
	}
}

function parseRawMatch(rawMatch) {
	let match = {
		matchId: rawMatch.matchid.toString(),
		matchTime: rawMatch.matchtime,
		demo: rawMatch.roundstatsall[rawMatch.roundstatsall.length - 1].map,
		serverIp: rawMatch.watchablematchinfo.server_ip,
		tvPort: rawMatch.watchablematchinfo.tv_port,
		tvSpectators: rawMatch.watchablematchinfo.tv_spectators,
		clDecryptdataKeyPub: rawMatch.watchablematchinfo.cl_decryptdata_key_pub.toString(),
		roundDurations: [],
		teams: [
			{
				scores: [],
				players: {},
			},
			{
				scores: [],
				players: {},
			},
		],
	};

	for (const round of rawMatch.roundstatsall) {
		const { teams, duration } = parseRound(round);
		match.roundDurations.push(duration);

		for (let index = 0; index < teams.length; index++) {
			const players = match.teams[index].players;
			const team = teams[index];

			match.teams[index].scores.push(team.score);

			for (const sid in team.results) {
				if (players[sid] === undefined) {
					players[sid] = {
						rounds: [],
					};
				}

				players[sid].rounds.push(team.results[sid]);
			}
		}
	}

	calculateTopBottomFraggers(match);

	calculateFinalScores(match);

	return match;
}

module.exports = {
	parseRawMatch,
};
