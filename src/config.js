require('dotenv').config();

module.exports = {
	steamWebApiKey: process.env.CSGOUPS_STEAM_WEB_API_KEY,
	steamUsername: process.env.CSGOUPS_STEAM_USERNAME,
	steamPassword: process.env.CSGOUPS_STEAM_PASSWORD,
	steamOtpSharedSecret: process.env.CSGOUPS_STEAM_OTP_SHARED_SECRET,
	discordToken: process.env.CSGOUPS_DISCORD_TOKEN,
	prefix: process.env.CSGOUPS_PREFIX,
	databaseLocation: process.env.CSGOUPS_DATABASE_LOCATION,
};
