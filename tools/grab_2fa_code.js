const SteamTotp = require('steam-totp');

const config = require('../src/config');

const code = SteamTotp.generateAuthCode(config.steamOtpSharedSecret);

console.log(code);