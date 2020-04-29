const { MessageEmbed } = require('discord.js');

const { EMBED_COLOR } = require('../consts');

module.exports = ({db}) => {
	return async (parsedMatch) => {
		let content = '';

		const embed = new MessageEmbed()
			.setTitle(`Match: ${parsedMatch.matchId}`)
			.setDescription(`[Demo](${parsedMatch.demo})`)
			.setFooter(`${parsedMatch.shareCode}`)
			.setColor(EMBED_COLOR)
			.setTimestamp(new Date(parsedMatch.matchTime * 1000));

		for (const player in parsedMatch.punishments) {
			const person = await db.getPerson({ steamId: player });

			if (person !== undefined) {
				content += `<@${person.discord_id}>`;
				const result = parsedMatch.punishments[player];
				embed.addField(
					`${person.name} - ${result.pushups} push-ups`,
					result.formattedReasons,
				);
			}
		}

		if (embed.fields.length === 0) {
			embed.addField(
				'Seems like I\'m not aware of any users in this match :(',
				'Ask the moderators of this bot to add yourself if you played in it!',
			);
		}

		return [content, embed];
	};
};
