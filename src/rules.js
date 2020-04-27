function calculateMetrics(match, team, otherTeam, player) {
	const scoresHalfPoint = Math.floor(team.scores.length / 2)
	const scoresHalfway = team.scores.slice(0, scoresHalfPoint);
	const halfTimeScre = scoresHalfway[scoresHalfway.length - 1];

	const otherScoresHalfPoint = Math.floor(otherTeam.scores.length / 2)
	const otherScoresHalfway = otherTeam.scores.slice(0, otherScoresHalfPoint);
	const otherHalfTimeScore = otherScoresHalfway[otherScoresHalfway.length - 1];

	const metrics = {
		leadByHalftime: halfTimeScre - otherHalfTimeScore,
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
		if (metrics.leadByHalftime >= 5) {
			// Loss (w/5+ rounds up at half) - Everyone does 30 Push Ups, Bottom Frag does 60
			if (metrics.bottomFragger) {
				const change = 60;
				pushups += change ;
				reasons.push({reason: "Loss, w/5+ rounds up at half, Bottom Frag", change});
			} else {
				const change = 30;
				pushups += change;
				reasons.push({reason: "Loss, w/5+ rounds up at half", change});
			}
		}
		else {
			// Loss - 15 Push Ups for Everyone, Bottom Frag does 30
			if (metrics.bottomFragger) {
				const change = 30;
				pushups += change ;
				reasons.push({reason: "Loss, Bottom Frag", change});
			} else {
				const change = 15;
				pushups += change;
				reasons.push({reason: "Loss", change});
			}
		}
	}
	else if (metrics.tiedMatch) {
		// Tie - 10 Push Ups for Everyone, Bottom Frag does 30
		if (metrics.bottomFragger) {
			const change = 30;
			pushups += change ;
			reasons.push({reason: "Tie, Bottom Frag", change});
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
			reasons.push({reason: "Won, Bottom Frag", change});
		}
	}

	let formattedReasons = '';
	for (const reason of reasons) {
		let prefix = '+';
		if (reasons.change < 0) {
			prefix = '-';
		}
		formattedReasons += `${prefix} ${reason.change} (${reason.reason})`;
	}

	if (pushups === 0) {
		return null;
	}

	return {pushups, reasons, formattedReasons};
}

module.exports = {
	processParsedMatch: (match) => {
		const players = {};

		const [teamA, teamB] = match.teams;

		for (const player in teamA.players) {
			const metrics = calculateMetrics(match, teamA, teamB, player);
			players[player] = calculatePushups(metrics);
		}

		for (const player in teamB.players) {
			const metrics = calculateMetrics(match, teamB, teamA, player);
			players[player] = calculatePushups(metrics);
		}

		for (const player in players) {
			if (players[player] === null) {
				delete players[player];
			}
		}

		return players;
	},
};
