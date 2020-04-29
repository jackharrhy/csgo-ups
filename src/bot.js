const { Client, MessageEmbed } = require('discord.js');

const { parseRawMatch } = require('./match');

const bot = new Client();

const codeBlockify = (text) => `\`\`\`${text}\`\`\``;
const langCodeBlockify = (lang, text) => codeBlockify(`${lang}\n${text}`);
const jsonCodeBlockify = (text) => langCodeBlockify('json', text);

module.exports = {
	initBot: ({ config, logger = console.log, csgo }) => {
		const commands = {
			'ping': (msg) => {
				msg.reply('Pong!');
			},
			'preview': async (msg, args) => {
				const shareCode = args;
				const match = await csgo.matchFromShareCode(shareCode);

				const parsedMatch = parseRawMatch(shareCode, match);

				const embed = new MessageEmbed()
					.setTitle(`Match: ${parsedMatch.matchId}`)
					.setDescription(`[Demo](${parsedMatch.demo})`)
					.setFooter(`${shareCode}`)
					.setColor(0xff0000)
					.setTimestamp(new Date(parsedMatch.matchTime * 1000));

				for (const player in parsedMatch.punishments) {
					const result = parsedMatch.punishments[player];
					embed.addField(
						`${player} - ${result.pushups} push-ups`,
						result.formattedReasons,
					);
				}

				msg.channel.send(embed);
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
