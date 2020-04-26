const {SteamClient, SteamUser, SteamGameCoordinator} = require('steam');
const {CSGOClient} = require('csgo');

const CSGO_GAME_ID = 730;

const steamClient = new SteamClient();
const steamUser = new SteamUser(steamClient);
const steamGC = new SteamGameCoordinator(steamClient, CSGO_GAME_ID);
const CSGO = new CSGOClient(steamUser, steamGC, false);

module.exports = {
    initCsgo: (config) => {
        const loggedIn = false;

        steamClient.on('connected', () => {
            steamUser.logOn({
                account_name: config.steamUsername,
                password: config.steamPassword,
            });
        });

        steamClient.on('logOnResponse', (proto) => {
            // TODO ensure log in was good
            console.log(proto);
            loggedIn = true;
        });

        return {
            connect: () => {
                steamClient.connect();
            },
            isLoggedIn: () => loggedIn,
        };
    },
};
