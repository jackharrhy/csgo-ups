const Discord = require('discord.js');
const bot = new Discord.Client();

const config = require('./config');
const { initCsgo } = require('./csgo');
const { parseRawMatch } = require('./match');

const csgo = initCsgo({
	config,
	logger: (message) => console.log(`CSGO: ${message}`),
});

bot.on('ready', () => {
	console.log(`Logged into Discord as ${bot.user.tag}!`);
});

const codeBlockify = (text) => `\`\`\`${text}\`\`\``;

const commands = {
	'ping': (msg) => {
		msg.reply('Pong!');
	},
	'match': async (msg, args) => {
		const match = await csgo.matchFromShareCode(args);
		const results = parseRawMatch(match);
		// msg.reply(codeBlockify(JSON.stringify(results.pop(), null, 2)));
	},
};

bot.on('message', async (msg) => {
	if (msg.content.startsWith(config.prefix)) {
		const request = msg.content.substring(config.prefix.length);
		for (command in commands) {
			if (request.startsWith(command)) {
				try {
					await commands[command](msg, request.substring(command.length + 1));
				}
				catch (err) {
					const { message, stack } = err;

					try {
						await msg.reply(`${message}${codeBlockify(stack)}`);
					}
					catch {
						const trimmedStack = `${stack.substring(0, 1900)}\n...`;
						await msg.reply(`${message}${codeBlockify(trimmedStack)}`);
					}
				}
			}
		}
	}
});

csgo.client.on('ready', async () => bot.login(config.discordToken));

csgo.connect();
