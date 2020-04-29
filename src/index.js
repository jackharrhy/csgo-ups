const config = require('./config');
const { initCsgo } = require('./csgo');
const { initBot } = require('./bot');
const { initDb } = require('./db');

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

		const bot = initBot({
			config,
			logger: (message) => console.log(`Bot: ${message}`),
			db,
			csgo,
		});

		csgo.client.on('ready', async () => bot.login(config.discordToken));

		csgo.connect();
	}
	catch (err) {
		console.error(err);
		process.exit(0);
	}
})();

