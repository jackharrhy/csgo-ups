function calculateMetrics(match, team, player) {
	const metrics = {
		tiedMatch: match.tie,
		wonMatch: team.winner,
		lostMatch: team.loss,
		bottomFragger: team.bottomFraggers.includes(player),
		topFragger: team.topFraggers.includes(player),
		...team.players[player].finalStats,
	};

	return metrics;
}

function calculatePushups(metrics) {
	let pushups = 0;
	const reasons = [];

	if (metrics.lostMatch) {
		// Loss (w/ 5+ rnds up at half) - Everyone does 30 Push Ups, Bottom Frag does 60

		// TODO figure out if 5 rounds were up at half

		// Loss - 15 Push Ups for Everyone, Bottom Frag does 30
		if (metrics.bottomFragger) {
			const change = 30;
			pushups += change ;
			reasons.push({reason: "Loss (Bottom Frag)", change});
		} else {
			const change = 15;
			pushups += change;
			reasons.push({reason: "Loss", change});
		}
	}
	else if (metrics.tiedMatch) {
		// Tie - 10 Push Ups for Everyone, Bottom Frag does 30
		if (metrics.bottomFragger) {
			const change = 30;
			pushups += change ;
			reasons.push({reason: "Tie (Bottom Frag)", change});
		} else {
			const change = 10;
			pushups += change;
			reasons.push({reason: "Tie", change});
		}
	}
	else if (metrics.wonMatch) {
		// Won - Bottom Frag does 20
		if (metrics.bottomFragger) {
			const change = 20;
			pushups += change ;
			reasons.push({reason: "Won (Bottom Frag)", change});
		}
	}

	return {pushups, reasons};
}

module.exports = {
	processParsedMatch: (match) => {
		const players = {};

		for (const team of match.teams) {
			for (const player in team.players) {
				const metrics = calculateMetrics(match, team, player);
				players[player] = calculatePushups(metrics);
			}
		}

		return players;
	},
};
