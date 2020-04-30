module.exports = {
	trigger: 'toggleadmin',
	args: '<@mention>',
	name: 'Toggle Admin',
	desc: 'toggles a person being an admin or not',
	requiresAdmin: true,
	init: ({ db }) => {
		return async (msg) => {
			const userMentions = Array.from(msg.mentions.users);
			if (userMentions.length !== 1) return msg.reply('Must mention a single user!');

			const discordId = userMentions[0][1].id;

			const { person } = await db.getPerson({ discordId });
			if (person === undefined) return msg.reply('Haven\'t seen such person before! (based on Discord ID)')

			const isAdmin = await db.toggleAdmin({ discordId });

			msg.reply(`<@${person.discord_id}> is ${isAdmin ? 'now' : 'no longer'} a admin`);
		};
	},
};
