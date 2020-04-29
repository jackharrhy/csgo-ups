const { MessageEmbed } = require('discord.js');

const { EMBED_COLOR } = require('../consts');

module.exports = {
	trigger: 'help',
	name: 'Help',
	args: '',
	desc: 'lists commands for this bot',
	requiresAdmin: false,
	init: ({commands}) => {
		return async(msg, args) => {
			const embed = new MessageEmbed()
				.setTitle(`Help`)
				.setColor(EMBED_COLOR);

			for (const command of commands) {
				embed.addField(`${command.name} - ${command.trigger} ${command.args}`, command.desc);
			}

			msg.reply(embed);
		};
	},
};
