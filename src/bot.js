const Discord = require('discord.js');

const { parseRawMatch } = require('./match');

const bot = new Discord.Client();

const codeBlockify = (text) => `\`\`\`${text}\`\`\``;

module.exports = {
	initBot: ({ config, logger, csgo }) => {
		const commands = {
			'ping': (msg) => {
				msg.reply('Pong!');
			},
			'match': async (msg, args) => {
				const match = await csgo.matchFromShareCode(args);
				const results = parseRawMatch(match);
				delete results.teams;
				msg.reply(codeBlockify(JSON.stringify(results, null, 2)));
			},
		};

		bot.on('ready', () => {
			logger(`Logged into Discord as ${bot.user.tag}!`);
		});

		bot.on('message', async (msg) => {
			if (msg.content.startsWith(config.prefix)) {
				const request = msg.content.substring(config.prefix.length);
				for (command in commands) {
					if (request.startsWith(command)) {
						logger(`Invoked with: ${request}`);
						try {
							await commands[command](msg, request.substring(command.length + 1));
						}
						catch (err) {
							const { message, stack } = err;

							logger(`Error occured!: ${message}`);
							console.error(stack);

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

		return bot;
	},
};
