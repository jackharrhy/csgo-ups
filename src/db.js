const { readFileSync } = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const initSql = readFileSync(path.join(__dirname, './sql/init.sql'), 'utf8');

module.exports = {
	initDb: async ({ config, logger = console.log }) => {
		const db = await open({
			filename: config.databaseLocation,
			driver: sqlite3.Database
		});

		logger('Database open');

		await db.exec(initSql);

		return {
			ingestParsedMatch: (match) => {
				// TODO
				console.log(match);
			},
		};
	},
};
