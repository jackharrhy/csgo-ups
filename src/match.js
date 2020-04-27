const SteamID = require('steamid');

const statKeys = ['kills', 'assists', 'deaths', 'scores', 'enemy_kills', 'enemy_headshots', 'mvps'];

function parseRound(round) {
	const stats = {};
	for (const key of statKeys) {
		stats[key] = round[key];
	}

	const accounts = round.reservation.account_ids;

	const results = [
		{rounds: []},
		{rounds: []},
	];

	for (let index = 0; index < accounts.length; index++) {
		const account = accounts[index];
		const sid = SteamID.fromIndividualAccountID(account).getSteam2RenderedID();
		const result = {};

		for (const key of statKeys) {
			result[key] = stats[key][index];
		}

		let target;
		if (index < 5) {
			target = results[0].rounds;
		} else {
			target = results[1].rounds;
		}

		if (Array.isArray(target[sid])) {
			target[sid].push = result;
		} else {
			target[sid] = [result];
		}
	}

	return results;
}

function parseRawMatch(rawMatch) {
	const match = {
		teams: [
			{
				players: {},
			},
			{
				players: {},
			},
		],
	};

	for (const round of rawMatch.roundstatsall) {
		const teams = parseRound(round);
		for (let index = 0; index < teams.length; index++) {
			const players = match.teams[index].players;
			const team = teams[index];

			for (const sid in team.rounds) {
				if (players[sid] === undefined) {
					players[sid] = {
						rounds: [],
					};
				}

				 players[sid].rounds.push(team.rounds[sid]);
			}
		}
	}

	return match;
}

module.exports = {
	parseRound,
	parseRawMatch,
};
