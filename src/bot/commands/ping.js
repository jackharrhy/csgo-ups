module.exports = {
	trigger: 'ping',
	args: '',
	name: 'Ping!',
	desc: 'pong',
	requiresAdmin: false,
	init: () => {
		return async(msg, args) => {
			msg.reply('Pong!');
		};
	},
};
