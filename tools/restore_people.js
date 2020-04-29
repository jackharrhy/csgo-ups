const fs = require('fs');
const data = JSON.parse(fs.readFileSync(0, 'utf-8'));

const config = require('../src/config');

const { initDb } = require('../src/db');

(async () => {
	try {
		const db = await initDb({config, logger: () => {}});

		for (const key in data.players) {
			const player = data.players[key];
			const query = `INSERT INTO player (id, steam_id, people_id) VALUES (?, ?, ?)`;
			await db.instance.run(query, ...Object.values(player));
		}

		for (const key in data.people) {
			const person = data.people[key];
			const query = `INSERT INTO people (id, name, discord_id) VALUES (?, ?, ?)`;
			await db.instance.run(query, ...Object.values(person));
		}
	}
	catch (err) {
		console.error(err);
	}
})();
