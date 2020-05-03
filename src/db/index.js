const { readFileSync } = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const { initUtils } = require('./utils');
const keyMapInitiator = require('./keyMaps');
const actionInitiators = require('./actions');

const fileGrabber = (file) => readFileSync(path.join(__dirname, `./sql/${file}.sql`), 'utf8');

const initSql = fileGrabber('init');
const viewsSql = fileGrabber('views');

module.exports = {
	initDb: async ({ config, logger = console.log }) => {
		const db = await open({
			filename: config.databaseLocation,
			driver: sqlite3.Database
		});

		logger('Database open');

		const {
			keyMaps: dbKeyMaps,
			verboseTableData,
		} = await keyMapInitiator({ db });

		const utils = initUtils({ db, dbKeyMaps });

		await db.exec(initSql);
		await db.exec(viewsSql);

		const actions = {};
		for (const key in actionInitiators) {
			actions[key] = actionInitiators[key]({ utils, dbKeyMaps });
		}

		return {
			instance: db,
			verboseTableData,
			...actions,
		};
	},
};
