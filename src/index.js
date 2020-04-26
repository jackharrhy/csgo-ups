const Discord = require('discord.js');
const bot = new Discord.Client();

const config = require('./config');
const { initCsgo } = require('./csgo');

const csgo = initCsgo({
	config,
	logger: (message) => console.log(`CSGO: ${message}`),
});

bot.on('ready', () => {
	console.log(`Logged into Discord as ${bot.user.tag}!`);
});

const commands = {
	'ping': (msg) => {
		msg.reply('Pong!');
	},
	'match': async (msg, args) => {
		const match = await csgo.matchFromShareCode(args);
		msg.reply(`got match: ${match.matchid}`);
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
					console.error(stack);
					try {
						await msg.reply(`${message}\`\`\`${stack}\`\`\``);
					}
					catch {
						await msg.reply(`${message}\`\`\`${stack.substring(0, 1900)}\n...\`\`\``);
					}
				}
			}
		}
	}
});

csgo.client.on('ready', async () => bot.login(config.discordToken));

csgo.connect();
