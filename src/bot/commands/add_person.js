const { MessageCollector } = require('discord.js');

module.exports = {
	trigger: 'addperson',
	args: '<@mention> <steam id> <name>',
	name: 'Add Person',
	desc: 'adds a person to the database',
	requiresAdmin: true,
	init: ({db, bot}) => {
		return async(msg, args) => {
			const userMentions = Array.from(msg.mentions.users);
			if (userMentions.length !== 1) return msg.reply('Must mention a single user!');

			const argParts = args.split(' ');
			if (argParts.length !== 3) return msg.reply('Invalid number of arguments!');

			const [mention, steamId, name] = argParts;

			const person = await db.getPerson({ steamId });
			if (person !== undefined) return msg.reply('Already seen person before! (based on Steam ID)')

			const collector = new MessageCollector(
				msg.channel,
				(m) => m.author.id === msg.author.id,
				{ max: 1, maxProcessed: 15 }
			);

			collector.on('collect', async (secondMsg) => {
				const lower = secondMsg.content.toLowerCase();
				if (lower === 'yes') {
					await db.addPerson({name, discordId: userMentions[0][0], steamId});
					secondMsg.reply(`Added ${name}!`);
				} else if (lower === 'no') {
					secondMsg.reply(`Didn\'t add ${name}!`);
				} else {
					secondMsg.reply(`Unknown response: ${secondMsg.content}`);
				}
				collector.stop();
			});

			msg.reply(
				`Adding new person:\n\`${name}\`, with Steam ID \`${steamId}\`, and Discord user ${mention}\nSay 'Yes' or 'No' to confirm/deny`
			);
		};
	},
};
