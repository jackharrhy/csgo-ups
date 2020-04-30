const fs = require('fs');
const data = JSON.parse(fs.readFileSync(0, 'utf-8'));

const config = require('../src/config');
const { initCsgo } = require('../src/csgo');
const { initDb } = require('../src/db');

const { parseRawMatch} = require('../src/match');

(async () => {
	try {
		const db = await initDb({
			config, logger: () => {},
			logger: (message) => console.log(`DB: ${message}`),
		});

		const csgo = initCsgo({
			config,
			logger: (message) => console.log(`CSGO: ${message}`),
		});

		csgo.client.on('ready', async () => {
			for (const shareCode of data) {
				console.log(shareCode);
				const match = await csgo.matchFromShareCode(shareCode);
				const parsedMatch = parseRawMatch(shareCode, match);
				await db.ingestParsedMatch(parsedMatch);
			}
			process.exit(0);
		});

		csgo.connect();
	}
	catch (err) {
		console.error(err);
		process.exit(0);
	}
})();

