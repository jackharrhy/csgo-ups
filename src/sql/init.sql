CREATE TABLE IF NOT EXISTS people (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	steam_id TEXT,
	discord_id TEXT,
	name TEXT
);

CREATE TABLE IF NOT EXISTS played_in (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player id,
	match id,
	team id,
	final_results id,
	FOREIGN KEY (player) REFERENCES player (id),
	FOREIGN KEY (match) REFERENCES match (id),
	FOREIGN KEY (team) REFERENCES team (id),
	FOREIGN KEY (final_results) REFERENCES round_player_stats (id)
);

CREATE TABLE IF NOT EXISTS match (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id INTEGER,
	match_time INTEGER,
	demo TEXT,
	server_ip INTEGER,
	tv_port INTEGER,
	tv_spectators INTEGER,
	cl_decrypt_data_key_pub INTEGER,
	team_a_final_score INTEGER,
	team_b_final_score INTEGER
);

CREATE TABLE IF NOT EXISTS round (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	number INTEGER,
	match_id INTEGER,
	FOREIGN KEY (match_id) REFERENCES match (id)
);

CREATE TABLE IF NOT EXISTS round_score (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	round id,
	team id,
	score INTEGER,
	FOREIGN KEY (round) REFERENCES round (id),
	FOREIGN KEY (team) REFERENCES team (id)
);

CREATE TABLE IF NOT EXISTS round_duration (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id id,
	round_id id,
	duration INTEGER,
	FOREIGN KEY (match_id) REFERENCES match (id),
	FOREIGN KEY (round_id) REFERENCES round (id)
);

CREATE TABLE IF NOT EXISTS team (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id id,
	FOREIGN KEY (match_id) REFERENCES match (id)
);

CREATE TABLE IF NOT EXISTS team_score (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id id,
	round_id id,
	scores INTEGER,
	FOREIGN KEY (match_id) REFERENCES match (id),
	FOREIGN KEY (round_id) REFERENCES round (id)
);

CREATE TABLE IF NOT EXISTS player (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	people_id id,
	FOREIGN KEY (people_id) REFERENCES people (id)
);

CREATE TABLE IF NOT EXISTS round_player_stats (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player id,
	round_id id,
	kills INTEGER,
	assists INTEGER,
	deaths INTEGER,
	scores INTEGER,
	enemy_kills INTEGER,
	enemy_headshots INTEGER,
	mvps INTEGER,
	FOREIGN KEY (player) REFERENCES player (id),
	FOREIGN KEY (round_id) REFERENCES round (id)
);
