const commando = require('discord.js-commando')
const path = require('path')
const sqlite = require('sqlite')
const client = new commando.CommandoClient({
    owner: '195688819821903872', // Your ID here.
    commandPrefix: 'p?', // The prefix of your bot.
    unknownCommandResponse: false, // Set this to true if you want to send a message when a user uses the prefix not followed by a command
})
//Server specifics
const submissionchannel = '855264608637681685'
const modchannel = '855246091871584256'
const pointemoji = '855263455681970205'
//Point balances
global.feverpoints = {
};

client.registry.registerDefaults()
	.registerGroups([
        ['test', 'usercommands']
	])
	.registerCommandsIn(path.join(__dirname,"commands"))

client.on('ready',()=>{
    console.log(`Logged in and ready to be used.. use "${client.commandPrefix}help".`)
})

//For reacts
client.on('message', message => {
	if (message.channel.id === submissionchannel) {
		message.react(pointemoji);
	}
});
/*
client.on("messageReactionAdd", function(messageReaction, user){
    console.log(`a reaction is added to a message`);
});*/

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);
client.login("ODU1MjEyNTk2NzQzMzcyODEx.YMvMzA.YgzDJ8FAXU3_N_TYnrsxHBkeobw")