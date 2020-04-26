const config = require('./config');
const {initCsgo} = require('./csgo');

const csgo = initCsgo({
    config,
    logger: (message) => console.log(`CSGO: ${message}`),
});

csgo.client.on('ready', async () => {
    // const match = await csgo.matchFromShareCode(testCode);
    // console.log("Match: ", match.matchid);
});

csgo.connect();