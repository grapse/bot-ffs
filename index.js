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
const botchannel = '855264608637681685'
const storychannel = '855264608637681685'
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

// For reacts
client.on('message', message => {
	if (message.channel.id === submissionchannel) {
		message.react(pointemoji);
	}
});

// Handle point budgets
client.on("messageReactionAdd", function(messageReaction, user){
    // only need if the reaction is not by bot & fever point emoji & in the right channel 
    if(user.id != '855212596743372811' && messageReaction.emoji.id === pointemoji
        && messageReaction.message.channel.id === submissionchannel){
        //if user does not have the role, remove it
        let User = messageReaction.message.guild.member(client.users.cache.get(user.id));
        console.log(User);
        if(User.roles.cache.some(r=>r.name==="🎸Summer Event")){
            // if budget is 1 or more, remove from budget. otherwise, remove reaction and warn user
            if(user.id in feverpoints){  
                if(feverpoints[user.id] > 0){
                    feverpoints[user.id] -= 1;
                }
                else{
                    messageReaction.message.reply('You are out of points!');
                    messageReaction.message.reactions.resolve(messageReaction).users.remove(user.id);
                }
            }
            else{  // Otherwise add to the dict
                feverpoints[user.id] = 7;  // Starts with 7 because 1 has been used just now
            }
        }
        else{  // remove the reaction
            messageReaction.message.reply('You are not part of the event!');
            messageReaction.message.reactions.resolve(messageReaction).users.remove(user.id);
        }
    }
    
});

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);
client.login("ODU1MjEyNTk2NzQzMzcyODEx.YMvMzA.YgzDJ8FAXU3_N_TYnrsxHBkeobw")