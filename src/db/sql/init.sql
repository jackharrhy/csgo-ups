CREATE TABLE IF NOT EXISTS people (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	discord_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS guild_association (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	guild_id TEXT NOT NULL,
	people_id INTEGER NOT NULL,
	FOREIGN KEY (people_id) REFERENCES people (id)
);

CREATE TABLE IF NOT EXISTS admin (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	people_id INTEGER NOT NULL,
	FOREIGN KEY (people_id) REFERENCES people (id)
);

CREATE TABLE IF NOT EXISTS player (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	steam_id TEXT NOT NULL,
	people_id INTEGER,
	FOREIGN KEY (people_id) REFERENCES people (id)
);

CREATE TABLE IF NOT EXISTS player_punishment (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id INTEGER NOT NULL,
	pushups INTEGER NOT NULL,
	"timestamp" TEXT NOT NULL,
	FOREIGN KEY (player_id) REFERENCES player (id)
);

CREATE TABLE IF NOT EXISTS player_match_punishment (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_punishment_id INTEGER NOT NULL,
	match_id INTEGER NOT NULL,
	FOREIGN KEY (player_punishment_id) REFERENCES player_punishment (id),
	FOREIGN KEY (match_id) REFERENCES "match" (id)
);

CREATE TABLE IF NOT EXISTS player_manual_punishment (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_punishment_id INTEGER NOT NULL,
	invoker_people_id INTEGER NOT NULL,
	FOREIGN KEY (player_punishment_id) REFERENCES player_punishment (id),
	FOREIGN KEY (invoker_people_id) REFERENCES people (id)
);

CREATE TABLE IF NOT EXISTS punishment_reason (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_punishment_id INTEGER NOT NULL,
	reason TEXT NOT NULL,
	change INTEGER NOT NULL,
	FOREIGN KEY (player_punishment_id) REFERENCES player_punishment (id)
);

CREATE TABLE IF NOT EXISTS played_in (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id INTEGER NOT NULL,
	match_id INTEGER NOT NULL,
	team_id INTEGER NOT NULL,
	final_stats_id INTEGER NOT NULL,
	FOREIGN KEY (player_id) REFERENCES player (id),
	FOREIGN KEY (match_id) REFERENCES "match" (id),
	FOREIGN KEY (team_id) REFERENCES team (id),
	FOREIGN KEY (final_stats_id) REFERENCES round_player_stats (id)
);

CREATE TABLE IF NOT EXISTS "match" (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id TEXT,
	share_code TEXT NOT NULL,
	match_time INTEGER,
	demo TEXT,
	server_ip INTEGER,
	tv_port INTEGER,
	tv_spectators INTEGER,
	cl_decrypt_data_key_pub TEXT,
	raw_match TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id INTEGER NOT NULL,
	score INTEGER NOT NULL,
	FOREIGN KEY (match_id) REFERENCES "match" (id)
);

CREATE TABLE IF NOT EXISTS "round" (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	match_id INTEGER NOT NULL,
	number INTEGER NOT NULL,
	duration INTEGER,
	FOREIGN KEY (match_id) REFERENCES "match" (id)
);

CREATE TABLE IF NOT EXISTS round_score (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	round_id INTEGER NOT NULL,
	team_id INTEGER NOT NULL,
	score INTEGER NOT NULL,
	FOREIGN KEY (round_id) REFERENCES "round" (id),
	FOREIGN KEY (team_id) REFERENCES team (id)
);

CREATE TABLE IF NOT EXISTS round_player_stats (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_id INTEGER NOT NULL,
	round_id INTEGER NOT NULL,
	kills INTEGER,
	assists INTEGER,
	deaths INTEGER,
	scores INTEGER,
	enemy_kills INTEGER,
	enemy_headshots INTEGER,
	mvps INTEGER,
	FOREIGN KEY (player_id) REFERENCES player (id),
	FOREIGN KEY (round_id) REFERENCES "round" (id)
);
