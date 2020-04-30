const config = require('../src/config');
const { initDb } = require('../src/db');

(async () => {
	try {
		const db = await initDb({config, logger: () => {}});

		const out = {
			players: [],
			people: [],
			admins: [],
		};

		const allAdmins = await db.instance.all("SELECT * FROM admin");

		for (const admin of allAdmins) {
			out.admins.push(admin);
		}

		const allPeople = await db.instance.all("SELECT * FROM people");

		for (const person of allPeople) {
			out.people.push(person);
			const player = await db.instance.get("SELECT * FROM player WHERE people_id = ?", person.id);
			out.players.push(player);
		}

		console.log(JSON.stringify(out, null, 2));
	}
	catch (err) {
		console.error(err);
	}
})();
