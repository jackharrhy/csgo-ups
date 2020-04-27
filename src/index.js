const config = require('./config');
const { initCsgo } = require('./csgo');
const { initBot } = require('./bot');

const csgo = initCsgo({
	config,
	logger: (message) => console.log(`CSGO: ${message}`),
});

const bot = initBot({
	config,
	logger: (message) => console.log(`Bot: ${message}`),
	csgo,
});

csgo.client.on('ready', async () => bot.login(config.discordToken));

csgo.connect();
