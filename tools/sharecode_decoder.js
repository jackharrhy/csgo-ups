const readline = require('readline');
const {SharecodeDecoder} = require('csgo');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Sharecode: ', (shareCode) => {
    const match = new SharecodeDecoder(shareCode).decode();
    console.log(match);
    rl.close();
});