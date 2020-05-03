const {nameMap} = require('./consts');

const tableListQuery = `
SELECT
		name
FROM
		sqlite_master
WHERE
		( type = 'table' OR type = 'view' )
		AND name NOT LIKE 'sqlite_%'
`;

module.exports = async ({db}) => {
	const tables = (await db.all(tableListQuery))
		.map((obj) => obj.name);

	const verboseTableData = {};
	const keyMaps = {};
	for (const table of tables) {
		verboseTableData[table] = {};
		keyMaps[table] = {};
		const query = `PRAGMA table_info(${table})`;
		const cols = await db.all(query);
		for (const col of cols) {
			verboseTableData[table][col.name] = col;
			keyMaps[table][col.name] = nameMap[col.type];
		}
	}
	return {verboseTableData, keyMaps};
};
