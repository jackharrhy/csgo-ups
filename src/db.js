const { readFileSync } = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const decamelize = require('decamelize');
const debug = require('debug')('csgoups:db')

const initSql = readFileSync(path.join(__dirname, './sql/init.sql'), 'utf8');

const INTEGER = 1;
const TEXT = 2;

const dbKeyMaps = {
	people: {
		name: TEXT,
		discord_id: INTEGER,
	},
	player: {
		steam_id: TEXT,
		people_id: INTEGER,
	},
	played_in: {
		player: INTEGER,
		match: INTEGER,
		team: INTEGER,
		final_results: INTEGER, // TODO UPDATE ONCE CREATED
	},
	match: {
		match_id: INTEGER,
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
};

module.exports = {
	initDb: async ({ config, logger = console.log }) => {
		const db = await open({
			filename: config.databaseLocation,
			driver: sqlite3.Database
		});

		logger('Database open');

		await db.exec(initSql);

		function smusher(tableName, object) {
			const cols = [];
			const args = [];
			for (const key in object) {
				const element = object[key];
				const dbName = decamelize(key);
				const keyMap = dbKeyMaps[tableName][dbName];

				if (keyMap !== undefined) {
					cols.push(dbName);
					if (keyMap === INTEGER) {
						args.push(parseInt(element, 10));
					}
					else if (keyMap === TEXT) {
						args.push(element.toString());
					}
				}
			}

			return [cols, args];
		}

		async function updater(tableName, cols, args, id, value) {
			let queryCols = cols
				.map((col) => `${col} = ?, `)
				.reduce((acum, col) => `${acum}${col}`)
				.slice(0, -2);
			args.push(id, value);

			const query = `UPDATE ${tableName} SET ${queryCols} WHERE ? = ?`;
			debug('updater:', query, args);
			return await db.run(query, ...args);
		}

		async function objectUpdater(tableName, object, id, value) {
			const [cols, args] = smusher(tableName, object);
			return await updater(tableName, cols, args, id, value);
		}

		async function putter(tableName, cols, args) {
			const queryCols = cols.reduce((acum, col) => `${acum}, ${col}`);
			const queryMarks = cols.map(() => '?').reduce((acum, mark) => `${acum}, ${mark}`);
			const query = `INSERT INTO ${tableName} (${queryCols}) VALUES (${queryMarks})`;
			debug('putter:', query, args);
			return await db.run(query, ...args);
		}

		async function objectPutter(tableName, object) {
			const [cols, args] = smusher(tableName, object);
			return await putter(tableName, cols, args);
		}

		async function alreadySeen(tableName, identifyCol, value) {
			const query = `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE ${identifyCol} = ?)`;
			debug('alreadySeen:', query, value);
			const result = await db.get(query, value);
			return 1 === Object.values(result)[0];
		}

		async function getter(tableName, identifyCol, value) {
			const query = `SELECT * FROM ${tableName} WHERE ${identifyCol} = ?`;
			debug('getter:', query, value);
			return await db.get(query, value);
		}

		return {
			addPerson: async ({ name, discordId, steamId }) => {
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
			},
			ingestParsedMatch: async (match) => {
				const seenMatchBefore = await alreadySeen('match', 'match_id', parseInt(match.matchId, 10));
				if (seenMatchBefore) throw new Error('Already seen match before!');
				const { lastID: dbMatchId } = await objectPutter('match', match);

				for (const team of match.teams) {
					const { lastID: dbTeamId } = await objectPutter('team', {
						matchId: dbMatchId,
						score: team.finalScore,
					});

					for (const steamId in team.players) {
						const seenPlayerBefore = await alreadySeen('player', 'steam_id', steamId);

						let dbPlayerId, dbPersonId;
						if (seenPlayerBefore) {
							const player = await getter('player', 'steam_id', steamId);
							dbPersonId = player.people_id;
							dbPlayerId = player.id;
						}
						else {
							dbPlayerId = (await objectPutter('player', { steamId })).lastID;
						}
						debug('player: ', steamId, dbPlayerId, dbPersonId);
					}
				}
			},
		};
	},
};