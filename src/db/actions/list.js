const debug = require('debug')('csgoups:db:action:list')

module.exports = ({ utils, dbKeyMaps }) => {
	const { all } = utils;

	const subActions = {};

	for (const tableName in dbKeyMaps) {
		subActions[tableName] = async () => {
			debug('all', tableName);
			return await all(tableName);
		};
	}

	return subActions;
};
