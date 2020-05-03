const { MessageEmbed } = require('discord.js');

const { EMBED_COLOR } = require('../consts');

const {
	codeBlockify,
	jsonCodeBlockify,
} = require('../utils');

const TABLES = [
	'admin',
	'people',
	'punishment_totals',
];

module.exports = {
	trigger: 'list',
	name: 'List',
	args: '',
	desc: 'lists different datapoints',
	requiresAdmin: true,
	ownerOnly: true,
	init: ({ db }) => {
		return async (msg, args) => {
			const embed = new MessageEmbed()
				.setTitle(`List: ${args}`)
				.setColor(EMBED_COLOR);

			if (args === '') {
				for (const tableName of TABLES) {
					embed.addField(
						codeBlockify(tableName),
						jsonCodeBlockify(JSON.stringify(db.verboseTableData[tableName])),
					);
				}
			} else {
				if (!TABLES.includes(args)) return msg.reply('Improper datapoint!');

				const list = await db.list[args]();
				for (const piece of list) {
					embed.addField(
						codeBlockify(JSON.stringify(Object.keys(piece))),
						jsonCodeBlockify(JSON.stringify(Object.values(piece))),
					);
				}
			}

			msg.reply(embed);
		};
	},
};
