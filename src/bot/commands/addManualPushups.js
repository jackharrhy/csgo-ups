const { MessageCollector } = require('discord.js');

module.exports = {
	trigger: 'addpushups',
	args: '<@mention> <#amount> <reason>',
	name: 'Add Pushups',
	desc: 'manually adds pushups to the database (negative values can be used for removing)',
	requiresAdmin: true,
	init: ({ db }) => {
		return async (msg, args) => {
			const userMentions = Array.from(msg.mentions.users);
			if (userMentions.length !== 1) return msg.reply('Must mention a single user!');

			const argParts = args.split(' ');
			if (argParts.length !== 3) return msg.reply('Invalid number of arguments!');

			const [mention, amountString, reason] = argParts;

			const amount = parseInt(amountString, 10);

			if (Number.isNaN(amount)) return msg.reply('Invalid amount!');

			const { person } = await db.getPerson({ discordId: userMentions[0][0] });
			if (person === undefined) return msg.reply('Haven\'t seen person before!');

			const collector = new MessageCollector(
				msg.channel,
				(m) => m.author.id === msg.author.id,
				{ max: 1, maxProcessed: 15 }
			);

			collector.on('collect', async (secondMsg) => {
				const lower = secondMsg.content.toLowerCase();
				if (lower === 'yes') {
					await db.addManualPushups({
						invokerDiscordId: msg.author.id,
						discordId: userMentions[0][0],
						amount,
						reason,
					});
					secondMsg.reply(`Added ${amount} pushups to ${person.name}`);
				} else if (lower === 'no') {
					secondMsg.reply(`Didn't add/remove any pushups`);
				} else {
					secondMsg.reply(`Unknown response: ${secondMsg.content}`);
				}
				collector.stop();
			});

			msg.reply(
				`Adding \`${amount}\` pushups to <@${mention}>,\nReason: \`${reason}\`\nSay 'Yes' or 'No' to confirm/deny`
			);
		};
	},
};
