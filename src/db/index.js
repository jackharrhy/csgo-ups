const { readFileSync } = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const { initUtils } = require('./utils');

const actionInitiators = require('./actions');

const initSql = readFileSync(path.join(__dirname, './sql/init.sql'), 'utf8');

module.exports = {
	initDb: async ({ config, logger = console.log }) => {
		const db = await open({
			filename: config.databaseLocation,
			driver: sqlite3.Database
		});

		logger('Database open');

		const utils = initUtils({ db });

		await db.exec(initSql);

		const actions = {};
		for (const key in actionInitiators) {
			actions[key] = actionInitiators[key]({utils});
		}

		return {
			instance: db,
			...actions,
		};
	},
};
