require("dotenv").config();

const {initCsgo} = require("./csgo");

const config = {
    steamWebApiKey: process.env.CSGOUPS_STEAM_WEB_API_KEY,
    steamUsername: process.env.CSGOUPS_STEAM_USERNAME,
    steamPassword: process.env.CSGOUPS_STEAM_PASSWORD,
};

const csgo = initCsgo(config);
csgo.connect();
