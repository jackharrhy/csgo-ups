const { EventEmitter } = require('events');
const Steam = require('steam');
const { SteamClient, SteamUser, SteamGameCoordinator } = Steam;
const { CSGOClient, SharecodeDecoder } = require('csgo');
const SteamTotp = require('steam-totp');

class MatchEmitter extends EventEmitter { };

const CSGO_GAME_ID = 730;
const DEFAULT_TIMEOUT = 1000 * 15; // 15s timeout on promise resolutions

const steamClient = new SteamClient();
const steamUser = new SteamUser(steamClient);
const steamGC = new SteamGameCoordinator(steamClient, CSGO_GAME_ID);
const csgo = new CSGOClient(steamUser, steamGC, false);

module.exports = {
	initCsgo: ({ config, logger = console.log }) => {
		let loggedIn = false;
		let csgoReady = false;

		const matchEmitter = new MatchEmitter();

		csgo.on('unhandled', (message) => logger(`Unhandled message: ${message}`));

		csgo.on('ready', () => {
			csgoReady = true;
			logger('CSGO ready!');
		});

		csgo.on('matchList', (data) => {
			if (!Array.isArray(data.matches)) {
				throw new Error('Expected matches attribute on matchList response');
			}

			data.matches.forEach((match) => {
				logger(`Got match: ${match.matchid}`);
				matchEmitter.emit('match', match)
			});
		});

		csgo.on('unready', () => {
			csgoReady = false;
			logger('CSGO unready');
		});

		csgo.on('exited', () => {
			csgoReady = false;
			logger('CSGO exited');
		});

		steamClient.on('connected', () => {
			logger('Connected to Steam, logging in...');
			const twoFactorCode = SteamTotp.generateAuthCode(config.steamOtpSharedSecret);
			steamUser.logOn({
				account_name: config.steamUsername,
				password: config.steamPassword,
				two_factor_code: twoFactorCode,
			});
		});

		steamClient.on('logOnResponse', (response) => {
			if (response.eresult !== Steam.EResult.OK) {
				throw new Error(`Failed to log into steam, got respose: ${JSON.stringify(response)}`);
			}

			loggedIn = true;

			logger('Logged in, launching CSGO...');
			csgo.launch();
		});

		return {
			client: csgo,
			connect: () => {
				logger('Connecting...');
				steamClient.connect();
			},
			isLoggedIn: () => loggedIn,
			isCsgoReady: () => csgoReady,
			matchFromShareCode: (shareCode) => new Promise((resolve, reject, timeout = DEFAULT_TIMEOUT) => {
				if (!csgoReady) reject(new Error('CSGO not ready!'));
				if (!shareCode.startsWith('CSGO-')) reject(new Error('Invalid shareCode'));

				const { matchId, outcomeId, tokenId } = new SharecodeDecoder(shareCode).decode();

				const timeoutHandler = setTimeout(() => reject(new Error('Request timed out')), timeout);

				const matchListener = (match) => {
					if (match.matchid.toNumber() == matchId) {
						clearTimeout(timeoutHandler);
						matchEmitter.removeListener('match', matchListener);
						resolve(match);
					}
				};
				matchEmitter.on('match', matchListener);

				logger(`Requesting match...: ${matchId}`);
				csgo.requestGame(matchId, outcomeId, parseInt(tokenId, 10));
			}),
		};
	},
};
