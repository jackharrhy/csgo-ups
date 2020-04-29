const {INTEGER, TEXT} = require('./consts');

module.exports = {
	people: {
		name: TEXT,
		discord_id: INTEGER,
	},
	player: {
		steam_id: TEXT,
		people_id: INTEGER,
	},
	played_in: {
		player_id: INTEGER,
		match_id: INTEGER,
		team_id: INTEGER,
		final_stats_id: INTEGER,
	},
	match: {
		match_id: INTEGER,
		share_code: TEXT,
		match_time: INTEGER,
		demo: TEXT,
		server_ip: INTEGER,
		tv_port: INTEGER,
		tv_spectators: INTEGER,
		cl_decrypt_data_key_pub: INTEGER,
	},
	team: {
		match_id: TEXT,
		score: INTEGER,
	},
	round: {
		match_id: INTEGER,
		duration: INTEGER,
		number: INTEGER,
	},
	round_score: {
		round_id: INTEGER,
		team_id: INTEGER,
		score: INTEGER,
	},
	round_player_stats: {
		player_id: INTEGER,
		round_id: INTEGER,
		kills: INTEGER,
		assists: INTEGER,
		deaths: INTEGER,
		scores: INTEGER,
		enemy_kills: INTEGER,
		enemy_headshots: INTEGER,
		mvps: INTEGER,
	}
};
