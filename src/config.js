require('dotenv').config();

module.exports = {
    steamWebApiKey: process.env.CSGOUPS_STEAM_WEB_API_KEY,
    steamUsername: process.env.CSGOUPS_STEAM_USERNAME,
    steamPassword: process.env.CSGOUPS_STEAM_PASSWORD,
    steamOtpSharedSecret: process.env.CSGOUPS_STEAM_OTP_SHARED_SECRET,
};

