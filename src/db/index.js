const { readFileSync } = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const initSql = readFileSync(path.join(__dirname, './sql/init.sql'), 'utf8');
const { initUtils } = require('./utils');

const {initAction: initIngestParsedMatch} = require('./actions/ingestParsedMatch');
const {initAction: initAddPeson} = require('./actions/addPerson');
const {initAction: initGetPerson } = require('./actions/getPerson');

module.exports = {
	initDb: async ({ config, logger = console.log }) => {
		const db = await open({
			filename: config.databaseLocation,
			driver: sqlite3.Database
		});

		logger('Database open');

		const utils = initUtils({ db });

		await db.exec(initSql);

		const actionArgs = {utils};
		const ingestParsedMatch = initIngestParsedMatch(actionArgs);
		const addPerson = initAddPeson(actionArgs);
		const getPerson = initGetPerson(actionArgs);

		return {
			ingestParsedMatch,
			addPerson,
			getPerson,
		};
	},
};
