const readline = require('readline');
const fs = require('fs');
const SteamUser = require('steam-user');

const config = require('../src/config');

const client = new SteamUser();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

client.logOn({
  'accountName': config.steamUsername,
  'password': config.steamPassword,
});

client.on('loggedOn', (details) => {
  console.log(`Logged into Steam as ${client.steamID.getSteam3RenderedID()}`);
  client.enableTwoFactor(function(e, response) {
    console.log('Got resonse: ', response);
    if (e) throw e;
    if (response.shared_secret === undefined) throw Error("Didn't get a shared_secert in response");

    const otpOut = `otp_${new Date()}.json`;
    console.log(`Writing to: ${otpOut}`);
    fs.writeFileSync(otpOut, JSON.stringify(response, null, 2), {mode: 0o600});

    rl.question('SMS Secret: ', (secret) => {
      client.finalizeTwoFactor(Buffer.from(response.shared_secret, 'base64'), secret, (e) => {
        if (e) throw e;
        console.log('DONE!');
      });
      rl.close();
    });
  });
});

client.on('error', (e) => console.log(e));
