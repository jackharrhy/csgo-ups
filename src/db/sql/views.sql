CREATE VIEW IF NOT EXISTS
	"punishment_overview"
AS
	SELECT
		guild_id,
		people.name,
		"timestamp",
		match_id,
		pushups,
		people_invoker.name AS manual_invoker_name,
		reason,
		change
	FROM
		guild_association JOIN people
		ON guild_association.people_id = people.id
		JOIN player
		ON people.id = player.people_id
		JOIN player_punishment
		ON player.id = player_punishment.player_id
		LEFT JOIN player_match_punishment
		ON player_match_punishment.player_punishment_id = player_punishment.id
		LEFT JOIN player_manual_punishment
		ON player_manual_punishment.player_punishment_id = player_punishment.id
		LEFT JOIN people AS people_invoker
		ON people_invoker.id = player_manual_punishment.invoker_people_id
		JOIN punishment_reason
		ON punishment_reason.player_punishment_id = player_punishment.id
	WHERE player.people_id IS NOT NULL
	ORDER BY datetime(player_punishment.timestamp);

CREATE VIEW IF NOT EXISTS
	"punishment_totals"
AS
	SELECT
		guild_id,
		name,
		SUM(pushups)
	FROM
		guild_association JOIN people
		ON guild_association.people_id = people.id
		JOIN player
		ON people.id = player.people_id
		JOIN player_punishment
		ON player.id = player_punishment.player_id
	GROUP BY name
	ORDER BY pushups;
