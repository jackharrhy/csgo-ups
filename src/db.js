const { readFileSync } = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const decamelize = require('decamelize');

const initSql = readFileSync(path.join(__dirname, './sql/init.sql'), 'utf8');

const INTEGER = 1;
const TEXT = 2;

const dbKeyMaps = {
	match: {
		match_id: INTEGER,
		match_time: INTEGER,
		demo: TEXT,
		server_ip: INTEGER,
		tv_port: INTEGER,
		tv_spectators: INTEGER,
		cl_decrypt_data_key_pub: INTEGER,
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

		async function putter(tableName, cols, args) {
			const queryCols = cols.reduce((acum, col) => `${acum}, ${col}`);
			const queryMarks = cols.map(() => '?').reduce((acum, mark) => `${acum}, ${mark}`);
			const query = `INSERT INTO ${tableName} (${queryCols}) VALUES (${queryMarks})`;
			return await db.run(query, ...args);
		}

		async function objectPuller(tableName, object) {
			const cols = [];
			const args = [];
			for (const key in object) {
				const element = object[key];
				const dbName = decamelize(key);
				const keyMap = dbKeyMaps[tableName][dbName];

				if (keyMap !== undefined) {
					cols.push(dbName);
					if (keyMap == INTEGER) {
						args.push(parseInt(element, 10));
					} else {
						args.push(element.toString());
					}
				}
			}

			return await putter('match', cols, args);
		}

		return {
			ingestParsedMatch: async (match) => {
				await objectPuller('match', match);
			},
		};
	},
};
