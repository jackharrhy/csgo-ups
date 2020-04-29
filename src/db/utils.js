const debug = require('debug')('csgoups:db:utils')
const decamelize = require('decamelize');

const {INTEGER, TEXT} = require('./consts');
const dbKeyMaps = require('./key_maps');

module.exports = {
	initUtils: ({db}) => {
		const transactionify = async (callback) => {
			debug("Transaction start");
			await db.exec('BEGIN TRANSACTION');
			try {
				await callback();
			} catch(err) {
				debug("Transaction rollback");
				await db.exec('ROLLBACK');
				throw err;
			}
			debug("Transaction commit");
			await db.exec('COMMIT');
		};

		const smusher = (tableName, object) => {
			const cols = [];
			const args = [];
			for (const key in object) {
				const element = object[key];
				const dbName = decamelize(key);
				const keyMap = dbKeyMaps[tableName][dbName];

				if (keyMap !== undefined) {
					cols.push(dbName);
					if (keyMap === INTEGER) {
						args.push(parseInt(element, 10));
					}
					else if (keyMap === TEXT) {
						args.push(element.toString());
					}
				}
			}

			return [cols, args];
		};

		const updater = async (tableName, cols, args, id, value) => {
			let queryCols = cols
				.map((col) => `${col} = ?, `)
				.reduce((acum, col) => `${acum}${col}`)
				.slice(0, -2);
			args.push(id, value);

			const query = `UPDATE ${tableName} SET ${queryCols} WHERE ? = ?`;
			debug('updater:', query, args);
			return await db.run(query, ...args);
		};

		const objectUpdater = async (tableName, object, id, value) => {
			const [cols, args] = smusher(tableName, object);
			return await updater(tableName, cols, args, id, value);
		};

		const putter = async (tableName, cols, args) => {
			const queryCols = cols.reduce((acum, col) => `${acum}, ${col}`);
			const queryMarks = cols.map(() => '?').reduce((acum, mark) => `${acum}, ${mark}`);
			const query = `INSERT INTO ${tableName} (${queryCols}) VALUES (${queryMarks})`;
			debug('putter:', query, args);
			return await db.run(query, ...args);
		};

		const objectPutter = async (tableName, object) => {
			const [cols, args] = smusher(tableName, object);
			return await putter(tableName, cols, args);
		};

		const alreadySeen = async (tableName, identifyCol, value) => {
			const query = `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE ${identifyCol} = ?)`;
			debug('alreadySeen:', query, value);
			const result = await db.get(query, value);
			return 1 === Object.values(result)[0];
		};

		const getter = async (tableName, identifyCol, value) => {
			const query = `SELECT * FROM ${tableName} WHERE ${identifyCol} = ?`;
			debug('getter:', query, value);
			return await db.get(query, value);
		};

		return {
			transactionify,
			smusher,
			updater,
			objectUpdater,
			putter,
			objectPutter,
			alreadySeen,
			getter,
		};
	}
}
