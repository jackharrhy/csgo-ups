const { Client } = require('discord.js');
const commands = require('./commands');
const common = require('./common');

const { codeBlockify } = require('./utils');

const bot = new Client();

module.exports = {
	initBot: ({ config, logger = console.log, db, csgo }) => {
		const commandLookup = {};
		const commandsThemselves = {};
		const commonLookup = {};

		for (const key in common) {
			commonLookup[key] = common[key]({db});
		}

		for (const command of commands) {
			commandsThemselves[command.trigger] = command;
			commandLookup[command.trigger] = command.init({
				db,
				csgo,
				common: commonLookup,
				commands,
			});
		}

		bot.on('ready', () => {
			logger(`Logged into Discord as ${bot.user.tag}!`);
		});

		bot.on('message', async (msg) => {
			if (msg.content.startsWith(config.prefix)) {
				const request = msg.content.substring(config.prefix.length);
				for (command in commandLookup) {
					if (request.startsWith(command)) {
						logger(`Invoked with: ${request}`);

						if (commandsThemselves[command].requiresAdmin) {
							const ownerId = (await bot.fetchApplication()).owner.id;
							if (msg.author.id !== ownerId) return msg.reply('Can only currently be used by bot owner!');
						}

						try {
							await commandLookup[command](msg, request.substring(command.length + 1));
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
