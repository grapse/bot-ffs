const commando = require('discord.js-commando')
const path = require('path')
const sqlite = require('sqlite')
const client = new commando.CommandoClient({
    owner: '195688819821903872', // Your ID here.
    commandPrefix: 'p?', // The prefix of your bot.
    unknownCommandResponse: false, // Set this to true if you want to send a message when a user uses the prefix not followed by a command
})
client.registry.registerDefaults()
client.on('ready',()=>{
    console.log(`Logged in and ready to be used.. use "${client.commandPrefix}help".`)
})
client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);
client.login("ODU1MjEyNTk2NzQzMzcyODEx.YMvMzA.YgzDJ8FAXU3_N_TYnrsxHBkeobw")